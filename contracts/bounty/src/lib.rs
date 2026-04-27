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
#[derive(Clone, Debug, PartialEq)]
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

// ── Contract Tests ─────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::{token, Env};

    fn setup_env() -> (Env, Address, Address, Address, BountyContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();

        // Deploy a SAC-style token for XLM simulation
        let admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(admin.clone());
        let token_address = token_contract.address();
        let token_admin = token::StellarAssetClient::new(&env, &token_address);

        // Deploy the bounty contract
        let bounty_contract = env.register(BountyContract, (&token_address,));
        let client = BountyContractClient::new(&env, &bounty_contract);

        // Fund poster
        let poster = Address::generate(&env);
        token_admin.mint(&poster, &1_000_000_000); // 100 XLM

        // Set ledger timestamp to a reasonable value
        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        (env, poster, token_address, bounty_contract, client)
    }

    #[test]
    fn test_post_bounty() {
        let (env, poster, _, _, client) = setup_env();

        let id = client.post_bounty(
            &poster,
            &String::from_str(&env, "Write a blog post"),
            &String::from_str(&env, "Write about Stellar"),
            &100_000_000, // 10 XLM
            &7,
        );

        assert_eq!(id, 1);
        assert_eq!(client.get_total(), 1);

        let bounty = client.get_bounty(&1);
        assert_eq!(bounty.status, BountyStatus::Open);
        assert_eq!(bounty.reward, 100_000_000);
        assert_eq!(bounty.poster, poster);
        assert!(bounty.hunter.is_none());
    }

    #[test]
    fn test_claim_bounty() {
        let (env, poster, _, _, client) = setup_env();
        let hunter = Address::generate(&env);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &50_000_000,
            &7,
        );

        client.claim_bounty(&hunter, &1);

        let bounty = client.get_bounty(&1);
        assert_eq!(bounty.status, BountyStatus::Claimed);
        assert_eq!(bounty.hunter, Some(hunter));
    }

    #[test]
    fn test_submit_proof() {
        let (env, poster, _, _, client) = setup_env();
        let hunter = Address::generate(&env);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &50_000_000,
            &7,
        );
        client.claim_bounty(&hunter, &1);
        client.submit_proof(
            &hunter,
            &1,
            &String::from_str(&env, "https://proof.example.com"),
        );

        let bounty = client.get_bounty(&1);
        assert_eq!(bounty.status, BountyStatus::Submitted);
    }

    #[test]
    fn test_approve_bounty_pays_hunter() {
        let (env, poster, token_address, _, client) = setup_env();
        let hunter = Address::generate(&env);
        let token = token::Client::new(&env, &token_address);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &100_000_000,
            &7,
        );

        let hunter_balance_before = token.balance(&hunter);

        client.claim_bounty(&hunter, &1);
        client.submit_proof(
            &hunter,
            &1,
            &String::from_str(&env, "https://proof.example.com"),
        );
        client.approve_bounty(&poster, &1);

        let bounty = client.get_bounty(&1);
        assert_eq!(bounty.status, BountyStatus::Approved);

        // Hunter should have received the reward
        let hunter_balance_after = token.balance(&hunter);
        assert_eq!(hunter_balance_after - hunter_balance_before, 100_000_000);
    }

    #[test]
    fn test_reject_bounty_reopens() {
        let (env, poster, _, _, client) = setup_env();
        let hunter = Address::generate(&env);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &50_000_000,
            &7,
        );
        client.claim_bounty(&hunter, &1);
        client.submit_proof(
            &hunter,
            &1,
            &String::from_str(&env, "https://proof.example.com"),
        );
        client.reject_bounty(&poster, &1);

        let bounty = client.get_bounty(&1);
        assert_eq!(bounty.status, BountyStatus::Open);
        assert!(bounty.hunter.is_none());
    }

    #[test]
    fn test_cancel_bounty_refunds_poster() {
        let (env, poster, token_address, _, client) = setup_env();
        let token = token::Client::new(&env, &token_address);
        let poster_balance_before = token.balance(&poster);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &100_000_000,
            &7,
        );

        // Poster balance decreased after posting
        assert_eq!(token.balance(&poster), poster_balance_before - 100_000_000);

        client.cancel_bounty(&poster, &1);

        let bounty = client.get_bounty(&1);
        assert_eq!(bounty.status, BountyStatus::Cancelled);

        // Poster should be refunded
        assert_eq!(token.balance(&poster), poster_balance_before);
    }

    #[test]
    fn test_get_all_bounties() {
        let (env, poster, _, _, client) = setup_env();

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task 1"),
            &String::from_str(&env, "Desc 1"),
            &10_000_000,
            &7,
        );
        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task 2"),
            &String::from_str(&env, "Desc 2"),
            &20_000_000,
            &14,
        );

        let all = client.get_all_bounties();
        assert_eq!(all.len(), 2);
    }

    #[test]
    #[should_panic(expected = "Bounty not open")]
    fn test_cannot_claim_already_claimed() {
        let (env, poster, _, _, client) = setup_env();
        let hunter1 = Address::generate(&env);
        let hunter2 = Address::generate(&env);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &50_000_000,
            &7,
        );
        client.claim_bounty(&hunter1, &1);
        client.claim_bounty(&hunter2, &1); // should panic
    }

    #[test]
    #[should_panic(expected = "Can only cancel open bounties")]
    fn test_cannot_cancel_claimed() {
        let (env, poster, _, _, client) = setup_env();
        let hunter = Address::generate(&env);

        client.post_bounty(
            &poster,
            &String::from_str(&env, "Task"),
            &String::from_str(&env, "Desc"),
            &50_000_000,
            &7,
        );
        client.claim_bounty(&hunter, &1);
        client.cancel_bounty(&poster, &1); // should panic
    }

    #[test]
    fn test_full_lifecycle() {
        let (env, poster, token_address, _, client) = setup_env();
        let hunter = Address::generate(&env);
        let token = token::Client::new(&env, &token_address);

        // 1. Post
        let id = client.post_bounty(
            &poster,
            &String::from_str(&env, "Full lifecycle test"),
            &String::from_str(&env, "Complete the cycle"),
            &200_000_000, // 20 XLM
            &7,
        );
        assert_eq!(id, 1);
        assert_eq!(client.get_bounty(&1).status, BountyStatus::Open);

        // 2. Claim
        client.claim_bounty(&hunter, &1);
        assert_eq!(client.get_bounty(&1).status, BountyStatus::Claimed);

        // 3. Submit proof
        client.submit_proof(
            &hunter,
            &1,
            &String::from_str(&env, "https://github.com/proof"),
        );
        assert_eq!(client.get_bounty(&1).status, BountyStatus::Submitted);

        // 4. Approve — hunter gets paid
        let hunter_balance_before = token.balance(&hunter);
        client.approve_bounty(&poster, &1);
        assert_eq!(client.get_bounty(&1).status, BountyStatus::Approved);
        assert_eq!(token.balance(&hunter) - hunter_balance_before, 200_000_000);
    }
}
