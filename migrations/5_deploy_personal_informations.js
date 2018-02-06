const PersonalInformations = artifacts.require('./PersonalInformations.sol'),
    Organizations = artifacts.require('./Organizations.sol');

module.exports = function(deployer, network, accounts) {
    deployer.deploy(PersonalInformations, Organizations.address);
}