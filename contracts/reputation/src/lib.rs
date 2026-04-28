#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

// ── Storage Keys ──────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Score(Address), // hunter address → u32 score
    Admin,          // bounty contract address (only admin can award)
}

// ── Events ────────────────────────────────────────────────────
pub const EVT_EARNED: Symbol = symbol_short!("EARNED");

// ── Contract ──────────────────────────────────────────────────
#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Initialize the contract with an admin address (the bounty contract).
    /// Only the admin can award reputation points.
    pub fn initialize(env: Env, admin: Address) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    /// Award non-transferable reputation points to a hunter.
    /// Called by the bounty contract (admin) when a bounty is approved.
    pub fn award_points(env: Env, caller: Address, hunter: Address, points: u32) {
        // Only the admin (bounty contract) can award points
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized");
        assert!(caller == admin, "Not authorized");
        caller.require_auth();

        let current: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Score(hunter.clone()))
            .unwrap_or(0);

        let new_score = current + points;

        env.storage()
            .persistent()
            .set(&DataKey::Score(hunter.clone()), &new_score);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Score(hunter.clone()), 100_000, 100_000);

        env.events()
            .publish((EVT_EARNED, hunter), (points, new_score));
    }

    /// Get the reputation score for a hunter. Returns 0 if never awarded.
    pub fn get_score(env: Env, hunter: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Score(hunter))
            .unwrap_or(0)
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized")
    }
}

// ── Tests ─────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    fn setup_contract() -> (Env, ReputationContractClient<'static>, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(ReputationContract, ());
        let client = ReputationContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let hunter = Address::generate(&env);

        client.initialize(&admin);

        (env, client, admin, hunter)
    }

    #[test]
    fn test_initialize() {
        let (_env, client, admin, _hunter) = setup_contract();
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_cannot_reinitialize() {
        let (env, client, _admin, _hunter) = setup_contract();
        let new_admin = Address::generate(&env);
        client.initialize(&new_admin);
    }

    #[test]
    fn test_award_points() {
        let (_env, client, admin, hunter) = setup_contract();

        // Initial score is 0
        assert_eq!(client.get_score(&hunter), 0);

        // Award 10 points
        client.award_points(&admin, &hunter, &10);
        assert_eq!(client.get_score(&hunter), 10);

        // Award 25 more points — cumulative
        client.award_points(&admin, &hunter, &25);
        assert_eq!(client.get_score(&hunter), 35);
    }

    #[test]
    #[should_panic(expected = "Not authorized")]
    fn test_only_admin_can_award() {
        let (env, client, _admin, hunter) = setup_contract();
        let imposter = Address::generate(&env);
        client.award_points(&imposter, &hunter, &10);
    }

    #[test]
    fn test_multiple_hunters() {
        let (env, client, admin, hunter1) = setup_contract();
        let hunter2 = Address::generate(&env);

        client.award_points(&admin, &hunter1, &50);
        client.award_points(&admin, &hunter2, &30);

        assert_eq!(client.get_score(&hunter1), 50);
        assert_eq!(client.get_score(&hunter2), 30);
    }

    #[test]
    fn test_unknown_hunter_returns_zero() {
        let (env, client, _admin, _hunter) = setup_contract();
        let unknown = Address::generate(&env);
        assert_eq!(client.get_score(&unknown), 0);
    }
}
