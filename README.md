[KYC (Know Your Customer)](https://guide.blockchain.z.com/docs/oss/kyc/) - GMO Blockchain Open Source
==================================================

License
--------------------------------------
License is [here](./LICENSE.txt).

Apart from forbidding the use of this software for criminal activity, this license is similar to the [MIT License](https://opensource.org/licenses/mit-license.php).

GMO Blockchain Open Source Common License document is [here](https://guide.blockchain.z.com/docs/oss/license/).

DEMO
--------------------------------------
You can check the operation of this sample project on this page.

http://oss.blockchain.z.com/kyc/

Explanation
--------------------------------------
- #### GMO Blockchain Open Source
    http://guide.blockchain.z.com/docs/oss/

- #### KYC (Know Your Customer)
    http://guide.blockchain.z.com/docs/oss/kyc/

Usage Guides
--------------------------------------

### Create Z.com Cloud Blockchain environment
see [Setup Development Environment](https://guide.blockchain.z.com/docs/init/setup/)

### Install application
```bash
git clone --recursive https://github.com/zcom-cloud-blockchain/oss-kyc.git
cd oss-kyc/server
npm install
```

### Deploy contracts
```bash
cd oss-kyc/provider
truffle migrate
```

### Set up for Z.com Cloud Blockchain
See [Basic Configuration](https://guide.blockchain.z.com/docs/dapp/setup/)

- ##### Set CNS address on admin console
  1. Open a file 'provider/build/contracts/ContractNameService.json'

  2. Use 'networks.(network-id).address' to register as CNS address on admin console

See [Contract Creation Process](https://guide.blockchain.z.com/docs/dapp/contract/)
- ##### Set Contract ABIs on admin console
  1. Open following files
    ```bash
    'provider/build/contracts/ProxyController_v1.json'
    ```
  2. Use 'networks.(network-id).address' and 'abi' values to register as Contract ABIs on admin console

### Configure for client
Create server/public/js/config.js based on server/public/js/config_template.js. Edit "CNS" which you deployed.

### Start application
```bash
cd oss-kyc
node server/app.js
```
