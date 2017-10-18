pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionLogic.sol';
import './Organizations.sol';
import './PersonalInformations.sol';

contract ProxyControllerLogic_v1 is VersionLogic {
    function ProxyControllerLogic_v1(ContractNameService _cns) VersionLogic (_cns, 'ProxyController') {}

    function getNonceInOrganizations(address _organizationsAddress, address _addr) constant returns (uint) {
        return Organizations(_organizationsAddress).nonces(_addr);
    }

    function createOrganization(address _organizationsAddress, bytes32 _organizationKey, uint _nonce, bytes _clientSign) {
        assert(Organizations(_organizationsAddress).createOrganizationWithSign(_organizationKey, _nonce, _clientSign));
    }

    function changeOrganizationActivation(address _organizationsAddress, uint _nonce, bytes _clientSign) {
        assert(Organizations(_organizationsAddress).changeActivationWithSign(_nonce, _clientSign));
    }

    function addOrganizationAdmin(address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        assert(Organizations(_organizationsAddress).addAdminWithSign(_addr, _nonce, _clientSign));
    }

    function removeOrganizationAdmin(address _organizationsAddress,  address _addr, uint _nonce, bytes _clientSign) {
        assert(Organizations(_organizationsAddress).removeAdminWithSign(_addr, _nonce, _clientSign));
    }

    function addOrganizationMember(address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        assert(Organizations(_organizationsAddress).addMemberWithSign(_addr, _nonce, _clientSign));
    }

    function removeOrganizationMember(address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        assert(Organizations(_organizationsAddress).removeMemberWithSign(_addr, _nonce, _clientSign));
    }

    function getNonceInPersonalInformations(address _personalInformationsAddress, address _addr) constant returns (uint) {
        return PersonalInformations(_personalInformationsAddress).nonces(_addr);
    }

    function createPersonalInformation(address _personalInformationsAddress, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _clientSign) {
        assert(PersonalInformations(_personalInformationsAddress).createWithSign(_user, _dataKey, _dataHash, _expires, _nonce, _clientSign));
    }

    function removePersonalInformation(address _personalInformationsAddress, address _user, bytes32 _dataKey, uint _nonce, bytes _clientSign) {
        assert(PersonalInformations(_personalInformationsAddress).removeWithSign(_user, _dataKey, _nonce, _clientSign));
    }

    function updatePersonalInformation(address _personalInformationsAddress, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _clientSign) {
        assert(PersonalInformations(_personalInformationsAddress).updateWithSign(_user, _dataKey, _dataHash, _expires, _nonce, _clientSign));
    }

    function getPersonalInformation(address _personalInformationsAddress, address _addr, bytes32 _certificationBodyKey, bytes32 _dataKey) constant returns (bool, bytes32, uint) {
        return PersonalInformations(_personalInformationsAddress).personalInformations(_addr, _certificationBodyKey, _dataKey);
    }
}
