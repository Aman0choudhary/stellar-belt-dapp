#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

// ── Storage Keys ──────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Dispute(u64),  // bounty_id → DisputeData
    Validators,    // Vec<Address> of approved validators
    Admin,         // contract admin
}

// ── Dispute Data ──────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug)]
pub struct DisputeData {
    pub bounty_id: u64,
    pub hunter: Address,
    pub poster: Address,
    pub votes_approve: u32,  // votes for hunter (hunter wins)
    pub votes_reject: u32,   // votes for poster (poster wins)
    pub voters: Vec<Address>, // who already voted
    pub resolved: bool,
    pub outcome: bool,       // true = hunter wins, false = poster wins
}

// ── Events ────────────────────────────────────────────────────
pub const EVT_RAISED: Symbol = symbol_short!("RAISED");
pub const EVT_VOTED: Symbol = symbol_short!("VOTED");
pub const EVT_RESOLVED: Symbol = symbol_short!("RESOLVED");

// ── Contract ──────────────────────────────────────────────────
#[contract]
pub struct DisputeContract;

#[contractimpl]
impl DisputeContract {
    /// Initialize with admin and 3 validator addresses.
    pub fn initialize(env: Env, admin: Address, validators: Vec<Address>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::Validators, &validators);
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    /// Hunter raises a dispute for a bounty.
    pub fn raise_dispute(env: Env, hunter: Address, poster: Address, bounty_id: u64) {
        hunter.require_auth();

        // Cannot raise dispute if one already exists for this bounty
        if env
            .storage()
            .persistent()
            .has(&DataKey::Dispute(bounty_id))
        {
            panic!("Dispute already exists for this bounty");
        }

        let dispute = DisputeData {
            bounty_id,
            hunter: hunter.clone(),
            poster,
            votes_approve: 0,
            votes_reject: 0,
            voters: Vec::new(&env),
            resolved: false,
            outcome: false,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Dispute(bounty_id), &dispute);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Dispute(bounty_id), 100_000, 100_000);

        env.events().publish((EVT_RAISED, hunter), bounty_id);
    }

    /// Validator votes on a dispute. 2-of-3 majority resolves it.
    pub fn vote(env: Env, validator: Address, bounty_id: u64, approve: bool) {
        validator.require_auth();

        // Must be a registered validator
        let validators: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Validators)
            .expect("Not initialized");
        assert!(validators.contains(&validator), "Not a validator");

        let mut dispute: DisputeData = env
            .storage()
            .persistent()
            .get(&DataKey::Dispute(bounty_id))
            .expect("No dispute found");

        assert!(!dispute.resolved, "Already resolved");
        assert!(
            !dispute.voters.contains(&validator),
            "Already voted"
        );

        // Record vote
        dispute.voters.push_back(validator.clone());
        if approve {
            dispute.votes_approve += 1;
        } else {
            dispute.votes_reject += 1;
        }

        // Resolve if 2 votes reached for either side
        if dispute.votes_approve >= 2 || dispute.votes_reject >= 2 {
            dispute.resolved = true;
            dispute.outcome = dispute.votes_approve >= 2;
            env.events().publish(
                (EVT_RESOLVED, validator.clone()),
                (bounty_id, dispute.outcome),
            );
        }

        env.storage()
            .persistent()
            .set(&DataKey::Dispute(bounty_id), &dispute);

        env.events()
            .publish((EVT_VOTED, validator), (bounty_id, approve));
    }

    /// Get dispute details for a bounty.
    pub fn get_dispute(env: Env, bounty_id: u64) -> DisputeData {
        env.storage()
            .persistent()
            .get(&DataKey::Dispute(bounty_id))
            .expect("No dispute found")
    }

    /// Check if a dispute exists for a bounty.
    pub fn has_dispute(env: Env, bounty_id: u64) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Dispute(bounty_id))
    }

    /// Get the list of validators.
    pub fn get_validators(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&DataKey::Validators)
            .expect("Not initialized")
    }
}

// ── Tests ─────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{vec, Env};

    fn setup_contract() -> (
        Env,
        DisputeContractClient<'static>,
        Address,
        Vec<Address>,
        Address,
        Address,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DisputeContract, ());
        let client = DisputeContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let v1 = Address::generate(&env);
        let v2 = Address::generate(&env);
        let v3 = Address::generate(&env);
        let validators = vec![&env, v1.clone(), v2.clone(), v3.clone()];

        let hunter = Address::generate(&env);
        let poster = Address::generate(&env);

        client.initialize(&admin, &validators);

        (env, client, admin, validators, hunter, poster)
    }

    #[test]
    fn test_initialize() {
        let (_env, client, _admin, validators, _hunter, _poster) = setup_contract();
        assert_eq!(client.get_validators().len(), 3);
        assert_eq!(client.get_validators(), validators);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_cannot_reinitialize() {
        let (env, client, _admin, _validators, _hunter, _poster) = setup_contract();
        let new_admin = Address::generate(&env);
        let new_validators = vec![&env, Address::generate(&env)];
        client.initialize(&new_admin, &new_validators);
    }

    #[test]
    fn test_raise_dispute() {
        let (_env, client, _admin, _validators, hunter, poster) = setup_contract();

        client.raise_dispute(&hunter, &poster, &1);

        assert!(client.has_dispute(&1));
        let dispute = client.get_dispute(&1);
        assert_eq!(dispute.bounty_id, 1);
        assert_eq!(dispute.hunter, hunter);
        assert_eq!(dispute.poster, poster);
        assert_eq!(dispute.votes_approve, 0);
        assert_eq!(dispute.votes_reject, 0);
        assert!(!dispute.resolved);
    }

    #[test]
    #[should_panic(expected = "Dispute already exists")]
    fn test_cannot_raise_duplicate_dispute() {
        let (_env, client, _admin, _validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);
        client.raise_dispute(&hunter, &poster, &1); // should panic
    }

    #[test]
    fn test_vote_approve() {
        let (_env, client, _admin, validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);

        let v1 = validators.get(0).unwrap();
        client.vote(&v1, &1, &true);

        let dispute = client.get_dispute(&1);
        assert_eq!(dispute.votes_approve, 1);
        assert_eq!(dispute.votes_reject, 0);
        assert!(!dispute.resolved);
    }

    #[test]
    fn test_resolve_hunter_wins() {
        let (_env, client, _admin, validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);

        let v1 = validators.get(0).unwrap();
        let v2 = validators.get(1).unwrap();
        client.vote(&v1, &1, &true);
        client.vote(&v2, &1, &true);

        let dispute = client.get_dispute(&1);
        assert!(dispute.resolved);
        assert!(dispute.outcome); // hunter wins
    }

    #[test]
    fn test_resolve_poster_wins() {
        let (_env, client, _admin, validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);

        let v1 = validators.get(0).unwrap();
        let v2 = validators.get(1).unwrap();
        client.vote(&v1, &1, &false);
        client.vote(&v2, &1, &false);

        let dispute = client.get_dispute(&1);
        assert!(dispute.resolved);
        assert!(!dispute.outcome); // poster wins
    }

    #[test]
    #[should_panic(expected = "Already voted")]
    fn test_cannot_vote_twice() {
        let (_env, client, _admin, validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);

        let v1 = validators.get(0).unwrap();
        client.vote(&v1, &1, &true);
        client.vote(&v1, &1, &false); // should panic
    }

    #[test]
    #[should_panic(expected = "Not a validator")]
    fn test_non_validator_cannot_vote() {
        let (env, client, _admin, _validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);

        let random = Address::generate(&env);
        client.vote(&random, &1, &true); // should panic
    }

    #[test]
    #[should_panic(expected = "Already resolved")]
    fn test_cannot_vote_after_resolved() {
        let (_env, client, _admin, validators, hunter, poster) = setup_contract();
        client.raise_dispute(&hunter, &poster, &1);

        let v1 = validators.get(0).unwrap();
        let v2 = validators.get(1).unwrap();
        let v3 = validators.get(2).unwrap();

        client.vote(&v1, &1, &true);
        client.vote(&v2, &1, &true); // resolves here
        client.vote(&v3, &1, &false); // should panic — already resolved
    }

    #[test]
    fn test_no_dispute_returns_false() {
        let (_env, client, _admin, _validators, _hunter, _poster) = setup_contract();
        assert!(!client.has_dispute(&999));
    }
}
