require('dotenv').config();
require('colors');

const { CronJob } = require('cron');
const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const readlineSync = require('readline-sync');

const { HttpsProxyAgent } = require('https-proxy-agent');
const { Wallet } = require('ethers');
const { provider, proxies } = require('../src/utils/config');
const { displayHeader } = require('../src/utils/utils');

const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
const agent = new HttpsProxyAgent(proxies);

async function registerStreak(wallet) {
  const headers = {
    authority: 'points-api.plumenetwork.xyz',
    Origin: 'https://miles.plumenetwork.xyz',
    Priority: 'u=1, i',
    Referer: 'https://miles.plumenetwork.xyz/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };
  // 根据这个url 获取 timezone, get请求
  const timeZoneUrl = `https://rpc.walletconnect.org/v1/identity/${wallet.address}?projectId=04cc015520f075c8d0d0b4ed6e27a764`;

  const timeZoneRes = await axios.get(timeZoneUrl, { headers, httpsAgent: agent, httpAgent: agent });
  console.log(timeZoneRes, 'timeZoneRes');
  // get nonce post请求
  // const nonceUrl = 'https://points-api.plumenetwork.xyz/auth/nonce';

  // const registerMsg = `miles.plumenetwork.xyz wants you to sign in with your Ethereum account:\n${wallet.address}\n\nPlease sign with your account\n\nURI: https://miles.plumenetwork.xyz\nVersion: 1\nChain ID: 161221135\nNonce: pNBvba6NSRpGmzp3J\nIssued At: 2024-08-05T02:43:54.174Z`;
}

async function runRegister() {
  displayHeader();
  console.log('');
  for (const privateKey of PRIVATE_KEYS) {
    try {
      const wallet = new Wallet(privateKey, provider);
      await registerStreak(wallet);
    } catch (error) {
      console.log(`[${moment().format('HH:mm:ss')}] Error: ${error}`.red);
    }
  }
}

runRegister();
