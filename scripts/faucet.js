const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { delay, displayHeader, logSuccess, logError } = require('../src/utils/utils');
const { createWallet, getAddress } = require('../src/utils/wallet');
const { provider, PRIVATE_KEY, CONTRACT_ADDRESS, proxies } = require('../src/utils/config');
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));

const agent = new HttpsProxyAgent(proxies);

(async () => {
  displayHeader();
  // TO DO 改为批量领水，每轮 都随机间隔领取所有钱包的水
  while (true) {
    console.log(`Starting the faucet claiming process...`.yellow);
    for (const privateKey of PRIVATE_KEYS) {
      try {
        const walletAddress = getAddress(privateKey, provider);
        console.log(`Using wallet address: ${walletAddress}`.yellow);
        console.log('Requesting tokens from the faucet...'.yellow);
        // TO DO 增加代理
        const { data } = await axios.post(
          'https://faucet.plumenetwork.xyz/api/faucet',
          {
            walletAddress,
            token: 'ETH',
            // token: 'GOON',
          },
          {
            headers: {}, // TO DO 增加 headers
            httpsAgent: agent,
            httpAgent: agent,
          },
        );

        const { salt, signature } = data;

        const wallet = createWallet(privateKey, provider);
        const transactionData = `0x103fc4520000000000000000000000000000000000000000000000000000000000000060${salt.substring(
          2,
        )}00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000345544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041${signature.substring(
          2,
        )}00000000000000000000000000000000000000000000000000000000000000`;

        try {
          console.log('Preparing transaction...'.yellow);
          const nonce = await wallet.getNonce();
          const feeData = await wallet.provider.getFeeData();
          const gasLimit = await wallet.estimateGas({
            data: transactionData,
            to: CONTRACT_ADDRESS,
          });
          const gasPrice = feeData.gasPrice;

          const transaction = {
            data: transactionData,
            to: CONTRACT_ADDRESS,
            gasLimit,
            gasPrice,
            nonce,
            value: 0,
          };

          console.log('Sending transaction...'.yellow);
          const result = await wallet.sendTransaction(transaction);
          logSuccess(result.from, result.hash);
        } catch (error) {
          logError(error);
        }
      } catch (error) {
        console.log(`[${moment().format('HH:mm:ss')}] Critical error: ${error.message}`.red);
        break;
      }
      // 2s开始下一个钱包
      await delay(3000);
    }

    // console.log('Retrying in 30 seconds...'.yellow);
    console.log('Retrying in 1 hour...'.yellow);
    await delay(60 * 60 * 1000);
  }
})();
