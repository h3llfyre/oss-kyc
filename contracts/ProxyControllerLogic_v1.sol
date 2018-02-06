pragma solidity ^0.4.8;

import 'zcom-contracts/contracts/VersionLogic.sol';
import './Organizations.sol';
import './PersonalInformations.sol';

contract ProxyControllerLogic_v1 is VersionLogic {
    function ProxyControllerLogic_v1(ContractNameService _cns) public VersionLogic (_cns, 'ProxyController') {}

    function getNonceInOrganizations(address _organizationsAddress, address _addr) public constant returns (uint) {
        return Organizations(_organizationsAddress).nonces(_addr);
    }

    function createOrganization(address _organizationsAddress, bytes32 _organizationKey, uint _nonce, bytes _clientSign) public {
        require(Organizations(_organizationsAddress).createOrganizationWithSign(_organizationKey, _nonce, _clientSign));
    }

    function addOrganizationMember(address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) public {
        require(Organizations(_organizationsAddress).addMemberWithSign(_addr, _nonce, _clientSign));
    }
    
    function getNonceInPersonalInformations(address _personalInformationsAddress, address _addr) public constant returns (uint) {
        return PersonalInformations(_personalInformationsAddress).nonces(_addr);
    }

    function createPersonalInformation(address _personalInformationsAddress, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _clientSign) public {
        require(PersonalInformations(_personalInformationsAddress).createWithSign(_user, _dataKey, _dataHash, _expires, _nonce, _clientSign));
    }

    function updatePersonalInformation(address _personalInformationsAddress, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _clientSign) public {
        require(PersonalInformations(_personalInformationsAddress).updateWithSign(_user, _dataKey, _dataHash, _expires, _nonce, _clientSign));
    }

    function getPersonalInformation(address _personalInformationsAddress, address _addr, bytes32 _certificationBodyKey, bytes32 _dataKey) public constant returns (bool, bytes32, uint) {
        return PersonalInformations(_personalInformationsAddress).personalInformations(_addr, _certificationBodyKey, _dataKey);
    }
}
