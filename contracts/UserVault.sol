// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract UserVault {
    struct VaultEntry {
        string cid;
        uint256 timestamp;
        string dataType;
    }

    mapping(address => VaultEntry[]) private userVaults;

    event DataStored(address indexed user, string cid, uint256 timestamp, string dataType);

    function storeData(string memory _cid, string memory _dataType) public {
        userVaults[msg.sender].push(VaultEntry({
            cid: _cid,
            timestamp: block.timestamp,
            dataType: _dataType
        }));

        emit DataStored(msg.sender, _cid, block.timestamp, _dataType);
    }

    function retrieveData() public view returns (VaultEntry[] memory) {
        return userVaults[msg.sender];
    }

    function getEntryCount() public view returns (uint256) {
        return userVaults[msg.sender].length;
    }
}