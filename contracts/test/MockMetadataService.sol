// SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "../interfaces/IMetadataService.sol";

contract MockMetadataService is IMetadataService {
    function uri(uint256) external view returns (string memory) {
        return "https://example.com/metadata/{id}";
    }
}