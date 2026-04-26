#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Counter,
}

pub const BUMPED: Symbol = symbol_short!("BUMPED");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    pub fn increment(env: Env) -> u32 {
        let count: u32 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let new_count = count + 1;

        env.storage().instance().set(&DataKey::Counter, &new_count);
        env.storage().instance().extend_ttl(100, 100);
        env.events().publish((BUMPED,), new_count);

        new_count
    }

    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Counter).unwrap_or(0)
    }

    pub fn reset(env: Env) {
        env.storage().instance().set(&DataKey::Counter, &0u32);
    }
}
