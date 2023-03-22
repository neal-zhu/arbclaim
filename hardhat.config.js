require("@nomicfoundation/hardhat-toolbox");
require("./tasks/claim");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
};
