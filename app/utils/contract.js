export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const CONTRACT_ABI = [
  "function storeData(string memory _cid, string memory _dataType) public",
  "function retrieveData() public view returns (tuple(string cid, uint256 timestamp, string dataType)[])",
  "function getEntryCount() public view returns (uint256)"
];