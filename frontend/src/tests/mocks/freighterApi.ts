export const getAddress = async () => ({ address: "" });
export const getNetwork = async () => "TESTNET";
export const getNetworkDetails = async () => ({ networkPassphrase: "Test SDF Network ; September 2015" });
export const getPublicKey = async () => "";
export const isAllowed = async () => false;
export const isConnected = async () => false;
export const requestAccess = async () => true;
export const setAllowed = async () => true;
export const signAuthEntry = async () => "";
export const signTransaction = async () => "";
export const signMessage = async () => "";

const freighterApi = {
  getAddress,
  getNetwork,
  getNetworkDetails,
  getPublicKey,
  isAllowed,
  isConnected,
  requestAccess,
  setAllowed,
  signAuthEntry,
  signTransaction,
  signMessage,
};

export default freighterApi;
