pragma solidity ^0.4.8;

contract Organizations {

    struct Organization {
        bool created;
        bool active;
        uint adminCount;
        mapping (address => bool) admins; // admin => bool
        mapping (address => bool) members; // member => bool
    }

    mapping (bytes32 => Organization) public organizations; // organizationKey => Organization
    mapping (address => bytes32) public adminOrganizationKeys; // adminAddress => OrganizationKey
    mapping (address => bytes32) public memberOrganizationKeys; // memberAddress => OrganizationKey

    // nonce for each account
    mapping(address => uint) public nonces;

    enum OrganizationAction {
        Create,
        Activate,
        Deactivate
    }

    enum AccountAction {
        Add,
        Remove
    }

    event OranizationEvent(bytes32 indexed _organizationKey, OrganizationAction action);
    event AdminEvent(bytes32 indexed _organizationKey, AccountAction action, address _address);
    event MemberEvent(bytes32 indexed _organizationKey, AccountAction action, address _address);

    /* ----------- modifiers ----------------- */

    modifier onlyByAdmin(address _addr) {
        require(isAdmin(_addr));
        _;
    }


    /* ----------- methods ----------------- */

    function isAdmin(address _addr) public constant returns (bool) {
        bytes32 organizationKey = adminOrganizationKeys[_addr];
        return organizationKey != 0 && organizations[organizationKey].admins[_addr];
    }

    function isMember(address _addr) public constant returns (bool) {
        bytes32 organizationKey = memberOrganizationKeys[_addr];
        return organizationKey != 0 && organizations[organizationKey].members[_addr];
    }

    function isActive(bytes32 _organizationKey) public constant returns (bool) {
        return organizations[_organizationKey].active;
    }


    function createOrganizationWithSign(bytes32 _organizationKey, uint _nonce, bytes _sign) public returns (bool) {
        bytes32 hash = calcEnvHash('createOrganizationWithSign');
        hash = keccak256(hash, _organizationKey);
        hash = keccak256(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce != nonces[from]) return false;
        nonces[from]++;

        return createOrganizationPrivate(from, _organizationKey);
    }

    function createOrganizationPrivate(address _from, bytes32 _organizationKey) private returns (bool) {
        if (organizations[_organizationKey].created) return false;
        OranizationEvent(_organizationKey, OrganizationAction.Create);
        AdminEvent(_organizationKey, AccountAction.Add, _from);
        organizations[_organizationKey] = Organization({created:true, active:true, adminCount:1});
        organizations[_organizationKey].admins[_from] = true;
        adminOrganizationKeys[_from] = _organizationKey;
        return true;
    }



    function addMemberWithSign(address _addr, uint _nonce, bytes _sign) public returns (bool) {
        bytes32 hash = calcEnvHash('addMemberWithSign');
        hash = keccak256(hash, _addr);
        hash = keccak256(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce != nonces[from]) return false;
        nonces[from]++;

        return addMemberPrivate(from, _addr);
    }

    function addMemberPrivate(address _from, address _addr) onlyByAdmin(_from) private returns (bool) {
        bytes32 organizationKey = adminOrganizationKeys[_from];
        if (!organizations[organizationKey].created) return false;
        if (adminOrganizationKeys[_addr] != 0 && adminOrganizationKeys[_addr] != organizationKey) return false;
        if (memberOrganizationKeys[_addr] != 0 && memberOrganizationKeys[_addr] != organizationKey) return false;

        MemberEvent(organizationKey, AccountAction.Add, _addr);
        organizations[organizationKey].members[_addr] = true;
        memberOrganizationKeys[_addr] = organizationKey;
        return true;
    }


    /* ----------- recover address ----------------- */

    function calcEnvHash(bytes32 _functionName) public constant returns (bytes32 hash) {
        hash = keccak256(this);
        hash = keccak256(hash, _functionName);
    }

    function recoverAddress(bytes32 _hash, bytes _sign)  public pure returns (address recoverdAddr) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        require(_sign.length == 65);

        assembly {
            r := mload(add(_sign, 32))
            s := mload(add(_sign, 64))
            v := byte(0, mload(add(_sign, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28);

        recoverdAddr = ecrecover(_hash, v, r, s);
        require(recoverdAddr != 0);
    }
}
