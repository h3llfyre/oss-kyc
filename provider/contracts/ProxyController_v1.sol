pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionContract.sol';
import './ProxyControllerLogic_v1.sol';

contract ProxyController_v1 is VersionContract {
    ProxyControllerLogic_v1 public logic_v1;

    function ProxyController_v1(ContractNameService _cns, ProxyControllerLogic_v1 _logic_v1) VersionContract(_cns, 'ProxyController') {
        logic_v1 = _logic_v1;
    }

    function getNonceInOrganizations(address _organizationsAddress, address _addr) constant returns (uint) {
        return logic_v1.getNonceInOrganizations(_organizationsAddress, _addr);
    }

    function createOrganization(bytes _sign, address _organizationsAddress, bytes32 _organizationKey, uint _nonce, bytes _clientSign) {
        logic_v1.createOrganization(_organizationsAddress, _organizationKey, _nonce, _clientSign);
    }

    function changeOrganizationActivation(bytes _sign, address _organizationsAddress, uint _nonce, bytes _clientSign) {
        logic_v1.changeOrganizationActivation(_organizationsAddress, _nonce, _clientSign);
    }

    function addOrganizationAdmin(bytes _sign, address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        logic_v1.addOrganizationAdmin(_organizationsAddress, _addr, _nonce, _clientSign);
    }

    function removeOrganizationAdmin(bytes _sign, address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        logic_v1.removeOrganizationAdmin(_organizationsAddress, _addr, _nonce, _clientSign);
    }

    function addOrganizationMember(bytes _sign, address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        logic_v1.addOrganizationMember(_organizationsAddress, _addr, _nonce, _clientSign);
    }

    function removeOrganizationMember(bytes _sign, address _organizationsAddress, address _addr, uint _nonce, bytes _clientSign) {
        logic_v1.removeOrganizationMember(_organizationsAddress, _addr, _nonce, _clientSign);
    }

    function getNonceInPersonalInformations(address _personalInformationsAddress, address _addr) constant returns (uint) {
        return logic_v1.getNonceInPersonalInformations(_personalInformationsAddress, _addr);
    }

    function createPersonalInformation(bytes _sign, address _personalInformationsAddress, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _clientSign) {
        logic_v1.createPersonalInformation(_personalInformationsAddress, _user, _dataKey, _dataHash, _expires, _nonce, _clientSign);
    }

    function removePersonalInformation(bytes _sign, address _personalInformationsAddress, address _user, bytes32 _dataKey, uint _nonce, bytes _clientSign) {
        logic_v1.removePersonalInformation(_personalInformationsAddress, _user, _dataKey, _nonce, _clientSign);
    }

    function updatePersonalInformation(bytes _sign, address _personalInformationsAddress, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _clientSign) {
        logic_v1.updatePersonalInformation(_personalInformationsAddress, _user, _dataKey, _dataHash, _expires, _nonce, _clientSign);
    }

    function getPersonalInformation(address _personalInformationsAddress, address _addr, bytes32 _certificationBodyKey, bytes32 _dataKey) constant returns (bool, bytes32, uint) {
        return logic_v1.getPersonalInformation(_personalInformationsAddress, _addr, _certificationBodyKey, _dataKey);
    }
}
