#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol, Vec,
};

#[contracttype]
pub enum DataKey {
    Bounty(u64),
    Counter,
    AllIds,
    Asset,
}

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum BountyStatus {
    Open,
    Claimed,
    Submitted,
    Approved,
    Rejected,
    Cancelled,
    Expired,
}

#[contracttype]
#[derive(Clone)]
pub struct BountyData {
    pub id: u64,
    pub poster: Address,
    pub hunter: Option<Address>,
    pub title: String,
    pub description: String,
    pub reward: i128,
    pub proof_link: String,
    pub deadline: u64,
    pub status: BountyStatus,
    pub created_at: u64,
}

pub const EVT_POSTED: Symbol = symbol_short!("POSTED");
pub const EVT_CLAIMED: Symbol = symbol_short!("CLAIMED");
pub const EVT_SUBMITTED: Symbol = symbol_short!("SUBMITTED");
pub const EVT_APPROVED: Symbol = symbol_short!("APPROVED");
pub const EVT_REJECTED: Symbol = symbol_short!("REJECTED");
pub const EVT_CANCELLED: Symbol = symbol_short!("CANCELLED");

#[contract]
pub struct BountyContract;

#[contractimpl]
impl BountyContract {
    pub fn __constructor(env: Env, asset: Address) {
        env.storage().instance().set(&DataKey::Asset, &asset);
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    fn asset_client(env: &Env) -> token::Client<'_> {
        let asset: Address = env
            .storage()
            .instance()
            .get(&DataKey::Asset)
            .expect("Asset contract not configured");

        token::Client::new(env, &asset)
    }

    pub fn post_bounty(
        env: Env,
        poster: Address,
        title: String,
        description: String,
        reward: i128,
        deadline_days: u64,
    ) -> u64 {
        poster.require_auth();
        assert!(reward > 0, "Reward must be positive");
        assert!(deadline_days > 0, "Deadline must be at least one day");

        let contract_address = env.current_contract_address();
        Self::asset_client(&env).transfer(&poster, &contract_address, &reward);

        let counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let id = counter + 1;

        let now = env.ledger().timestamp();
        let deadline = now + (deadline_days * 86_400);

        let bounty = BountyData {
            id,
            poster: poster.clone(),
            hunter: None,
            title,
            description,
            reward,
            proof_link: String::from_str(&env, ""),
            deadline,
            status: BountyStatus::Open,
            created_at: now,
        };

        env.storage().persistent().set(&DataKey::Bounty(id), &bounty);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Bounty(id), 100_000, 100_000);

        env.storage().instance().set(&DataKey::Counter, &id);
        let mut ids: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::AllIds)
            .unwrap_or(Vec::new(&env));
        ids.push_back(id);
        env.storage().instance().set(&DataKey::AllIds, &ids);
        env.storage().instance().extend_ttl(100_000, 100_000);

        env.events().publish((EVT_POSTED, poster), (id, reward));
        id
    }

    pub fn claim_bounty(env: Env, hunter: Address, bounty_id: u64) {
        hunter.require_auth();

        let mut bounty: BountyData = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        assert!(bounty.status == BountyStatus::Open, "Bounty not open");
        assert!(env.ledger().timestamp() < bounty.deadline, "Bounty expired");

        bounty.hunter = Some(hunter.clone());
        bounty.status = BountyStatus::Claimed;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        env.events().publish((EVT_CLAIMED, hunter), bounty_id);
    }

    pub fn submit_proof(env: Env, hunter: Address, bounty_id: u64, proof_link: String) {
        hunter.require_auth();

        let mut bounty: BountyData = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        assert!(bounty.status == BountyStatus::Claimed, "Bounty not claimed");
        assert!(bounty.hunter == Some(hunter.clone()), "Not the assigned hunter");

        bounty.proof_link = proof_link;
        bounty.status = BountyStatus::Submitted;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        env.events().publish((EVT_SUBMITTED, hunter), bounty_id);
    }

    pub fn approve_bounty(env: Env, poster: Address, bounty_id: u64) {
        poster.require_auth();

        let mut bounty: BountyData = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        assert!(bounty.status == BountyStatus::Submitted, "No submission to approve");
        assert!(bounty.poster == poster, "Not the poster");

        let hunter = bounty.hunter.clone().expect("No hunter");
        let contract_address = env.current_contract_address();
        Self::asset_client(&env).transfer(&contract_address, &hunter, &bounty.reward);

        bounty.status = BountyStatus::Approved;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        env.events()
            .publish((EVT_APPROVED, poster), (bounty_id, hunter, bounty.reward));
    }

    pub fn reject_bounty(env: Env, poster: Address, bounty_id: u64) {
        poster.require_auth();

        let mut bounty: BountyData = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        assert!(bounty.status == BountyStatus::Submitted, "No submission to reject");
        assert!(bounty.poster == poster, "Not the poster");

        bounty.hunter = None;
        bounty.proof_link = String::from_str(&env, "");
        bounty.status = BountyStatus::Open;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        env.events().publish((EVT_REJECTED, poster), bounty_id);
    }

    pub fn cancel_bounty(env: Env, poster: Address, bounty_id: u64) {
        poster.require_auth();

        let mut bounty: BountyData = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        assert!(bounty.status == BountyStatus::Open, "Can only cancel open bounties");
        assert!(bounty.poster == poster, "Not the poster");

        let contract_address = env.current_contract_address();
        Self::asset_client(&env).transfer(&contract_address, &poster, &bounty.reward);

        bounty.status = BountyStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        env.events().publish((EVT_CANCELLED, poster), bounty_id);
    }

    pub fn get_bounty(env: Env, bounty_id: u64) -> BountyData {
        env.storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found")
    }

    pub fn get_all_bounties(env: Env) -> Vec<BountyData> {
        let ids: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::AllIds)
            .unwrap_or(Vec::new(&env));
        let mut bounties = Vec::new(&env);

        for id in ids.iter() {
            if let Some(item) = env.storage().persistent().get(&DataKey::Bounty(id)) {
                bounties.push_back(item);
            }
        }

        bounties
    }

    pub fn get_total(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Counter).unwrap_or(0)
    }
}
