require('dotenv').config();
const { JsonRpcProvider } = require('ethers');
const { PLUME_ABI } = require('../ABI/abi');

const RPC_URL = 'https://testnet-rpc.plumenetwork.xyz/http';
const proxies = 'http://customer-angi_jerry:090569Zd@jp-pr.oxylabs.io:40000';
const CONTRACT_ADDRESS = PLUME_ABI.at(-1).CA;
const provider = new JsonRpcProvider(RPC_URL);
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = { RPC_URL, CONTRACT_ADDRESS, provider, PRIVATE_KEY, proxies };
