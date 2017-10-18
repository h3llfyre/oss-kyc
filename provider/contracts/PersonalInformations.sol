pragma solidity ^0.4.8;

import './Organizations.sol';

contract PersonalInformations {

    struct PersonalInformation {
        bool isCreated;
        bytes32 dataHash;
        uint expires;
    }

    // [0] => user address
    // [1] => organizationKey
    // [2] => dataKey ex... 'license', 'picture', 'mynumber', ...
    mapping(address => mapping(bytes32 => mapping(bytes32 => PersonalInformation))) public personalInformations;
    Organizations public organizations;
    mapping(address => uint) public nonces;

    event SetPersonalInformationsEvent(address indexed user, bytes32 indexed certificationBodyKey, bytes32 dataKey, bytes32 indexed dataHash);

    function PersonalInformations(Organizations _organizations) {
        organizations = _organizations;
    }

    modifier onlyByOrganizationMember(address _addr) {
        bytes32 organizationKey = organizations.memberOrganizationKeys(_addr);
        assert(organizations.isMember(_addr) && organizations.isActive(organizationKey));
        _;
    }

    function create(address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires) returns (bool) {
        return createPrivate(msg.sender, _user, _dataKey, _dataHash, _expires);
    }

    function createWithSign(address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _sign) returns (bool) {
        bytes32 hash = calcEnvHash('createWithSign');
        hash = sha3(hash, _user);
        hash = sha3(hash, _dataKey);
        hash = sha3(hash, _dataHash);
        hash = sha3(hash, _expires);
        hash = sha3(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce != nonces[from]) return false;
        nonces[from]++;

        return createPrivate(from, _user, _dataKey, _dataHash, _expires);
    }

    function createPrivate(address _from, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires) onlyByOrganizationMember(_from) private returns (bool) {
        bytes32 certificationBodyKey = organizations.memberOrganizationKeys(_from);
        if (personalInformations[_user][certificationBodyKey][_dataKey].isCreated) return false;

        personalInformations[_user][certificationBodyKey][_dataKey] = PersonalInformation({ isCreated: true, dataHash: _dataHash, expires: _expires });
        SetPersonalInformationsEvent(_user, certificationBodyKey, _dataKey, _dataHash);
        return true;
    }

    function remove(address _user, bytes32 _dataKey) returns (bool) {
        return removePrivate(msg.sender, _user, _dataKey);
    }

    function removeWithSign(address _user, bytes32 _dataKey, uint _nonce, bytes _sign) returns (bool) {
        bytes32 hash = calcEnvHash('removeWithSign');
        hash = sha3(hash, _user);
        hash = sha3(hash, _dataKey);
        hash = sha3(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce != nonces[from]) return false;
        nonces[from]++;

        return removePrivate(from, _user, _dataKey);
    }

    function removePrivate(address _from, address _user, bytes32 _dataKey) onlyByOrganizationMember(_from) private returns (bool) {
        bytes32 certificationBodyKey = organizations.memberOrganizationKeys(_from);
        if (!personalInformations[_user][certificationBodyKey][_dataKey].isCreated) return false;

        personalInformations[_user][certificationBodyKey][_dataKey] = PersonalInformation({ isCreated: false, dataHash: 0, expires: 0 });
        SetPersonalInformationsEvent(_user, certificationBodyKey, _dataKey, 0);
        return true;
    }

    function update(address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires) returns (bool) {
        return updatePrivate(msg.sender, _user, _dataKey, _dataHash, _expires);
    }

    function updateWithSign(address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires, uint _nonce, bytes _sign) returns (bool) {
        bytes32 hash = calcEnvHash('updateWithSign');
        hash = sha3(hash, _user);
        hash = sha3(hash, _dataKey);
        hash = sha3(hash, _dataHash);
        hash = sha3(hash, _expires);
        hash = sha3(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce != nonces[from]) return false;
        nonces[from]++;

        return updatePrivate(from, _user, _dataKey, _dataHash, _expires);
    }

    function updatePrivate(address _from, address _user, bytes32 _dataKey, bytes32 _dataHash, uint _expires) onlyByOrganizationMember(_from) private returns (bool) {
        bytes32 certificationBodyKey = organizations.memberOrganizationKeys(_from);
        if (!personalInformations[_user][certificationBodyKey][_dataKey].isCreated) return false;

        personalInformations[_user][certificationBodyKey][_dataKey].dataHash = _dataHash;
        personalInformations[_user][certificationBodyKey][_dataKey].expires = _expires;
        SetPersonalInformationsEvent(_user, certificationBodyKey, _dataKey, _dataHash);
        return true;
    }


    function calcEnvHash(bytes32 _functionName) constant returns (bytes32 hash) {
        hash = sha3(this);
        hash = sha3(hash, _functionName);
    }

    function recoverAddress(bytes32 _hash, bytes _sign) constant returns (address recoverdAddr) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        assert(_sign.length == 65);

        assembly {
            r := mload(add(_sign, 32))
            s := mload(add(_sign, 64))
            v := byte(0, mload(add(_sign, 96)))
        }

        if (v < 27) v += 27;
        assert(v == 27 || v == 28);

        recoverdAddr = ecrecover(_hash, v, r, s);
        assert(recoverdAddr != 0);
    }
}
