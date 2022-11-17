import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.9",

  networks: {
    ivarextestnet: {
      url: "https://testnet.ivarex.com",
      chainId: 16888,
      accounts: {
        mnemonic:
          process.env.MNEMONIC
      },
    },
  },

  etherscan: {
    apiKey: {
      ivarextestnet: ':D',

    },
    customChains: [
      {
        network: "ivarextestnet",
        chainId: 16888,
        urls: {
          apiURL: "https://testnet.ivarscan.com/api",
          browserURL: "https://testnet.ivarscan.com/",
        },
      },
    ]
  }

};

export default config;
