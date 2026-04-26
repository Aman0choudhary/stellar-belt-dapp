# Counter Contract (Level 2)

Build and deploy on Stellar Testnet:

```bash
cd contracts/counter
stellar contract build

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/counter.wasm \
  --source deployer \
  --network testnet
```

After deploy, add the contract id to frontend env:

```env
VITE_COUNTER_CONTRACT_ID=<YOUR_CONTRACT_ID>
```

Quick invoke checks:

```bash
stellar contract invoke --id <YOUR_CONTRACT_ID> --source deployer --network testnet -- increment
stellar contract invoke --id <YOUR_CONTRACT_ID> --source deployer --network testnet -- get_count
```
