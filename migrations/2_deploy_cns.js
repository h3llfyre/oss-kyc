const ContractNameService = artifacts.require('zcom-contracts/contracts/ContractNameService.sol');

module.exports = function(deployer, network, accounts) {
    deployer.deploy(ContractNameService);
}
