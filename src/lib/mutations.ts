export type NetworkState = {
  isConnected: boolean | null | undefined;
};

const OFFLINE_MESSAGE = "Connect to the internet before saving changes.";

export function getMutationBlockedReason(network: NetworkState) {
  return network.isConnected === false ? OFFLINE_MESSAGE : null;
}

export function assertOnlineForMutation(network: NetworkState) {
  const reason = getMutationBlockedReason(network);
  if (reason) throw new Error(reason);
}
