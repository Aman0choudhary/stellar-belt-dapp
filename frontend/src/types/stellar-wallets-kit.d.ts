declare module "@creit.tech/stellar-wallets-kit" {
  export enum Networks {
    PUBLIC = "Public Global Stellar Network ; September 2015",
    TESTNET = "Test SDF Network ; September 2015",
    FUTURENET = "Test SDF Future Network ; October 2022",
    SANDBOX = "Local Sandbox Stellar Network ; September 2022",
    STANDALONE = "Standalone Network ; February 2017",
  }

  export interface WalletModuleDescriptor {
    productId: string;
    productName: string;
  }

  export interface AuthModalOptions {
    container?: HTMLElement;
  }

  export interface SignTransactionOptions {
    address?: string;
    networkPassphrase?: string;
  }

  export interface SignedTransactionResult {
    signedTxXdr: string;
    signerAddress?: string;
  }

  export interface InitOptions {
    modules: unknown[];
    selectedWalletId?: string;
    network?: string;
    authModal?: {
      showInstallLabel?: boolean;
      hideUnsupportedWallets?: boolean;
    };
  }

  export class StellarWalletsKit {
    static init(params: InitOptions): void;
    static setWallet(id: string): void;
    static setNetwork(network: string): void;
    static authModal(params?: AuthModalOptions): Promise<{ address: string }>;
    static getAddress(): Promise<{ address: string }>;
    static fetchAddress(): Promise<{ address: string }>;
    static signTransaction(
      xdr: string,
      opts?: SignTransactionOptions
    ): Promise<SignedTransactionResult>;
    static disconnect(): Promise<void>;
    static readonly selectedModule: WalletModuleDescriptor;
  }
}

declare module "@creit.tech/stellar-wallets-kit/modules/utils" {
  export function defaultModules(opts?: {
    filterBy?: (module: { productId: string; productName: string }) => boolean;
  }): unknown[];
}
