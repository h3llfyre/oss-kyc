var prepareCertificationAuthorities = function(callback) {

    var certificationBodyAccount = LOCAL_STORAGE.getCertificationBodyAccount();
    var certificationBodyID = LOCAL_STORAGE.getCertificationBodyID();
    var bankAccount = LOCAL_STORAGE.getBankAccount();
    var userAccount = LOCAL_STORAGE.getUserAccount();
    if (!certificationBodyAccount || !certificationBodyID || !bankAccount || !userAccount) {

        DEMO_UTIL.confirmDialog(
            demoMsg('common.dialog.err-no-certification-authority.title'),
            demoMsg('common.dialog.err-no-certification-authority.msg'),
            function() {

                DEMO_UTIL.startLoad();
                $(this).dialog("close");

                registerAccount(certificationBodyAccount, function(certificationBodyAccount) {
                    registerAccount(bankAccount, function(bankAccount) {
                        var certificationBodyId = DEMO_UTIL.createRandomId(32);
                        createOrganization(certificationBodyAccount, certificationBodyId, function(err) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            ETH_UTIL.generateNewAccount(function(user) {
                                LOCAL_STORAGE.setCertificationBodyAccount(certificationBodyAccount);
                                LOCAL_STORAGE.setBankAccount(bankAccount);
                                LOCAL_STORAGE.setCertificationBodyID(certificationBodyId);
                                LOCAL_STORAGE.setUserAccount(user);
                                DEMO_UTIL.stopLoad();
                                callback();
                            });
                        });
                    });
                });
            },
            function() {
                window.location.href = './index.html';
            }
        );
        return;
    }
    callback();
};

var createOrganization = function(account, key, callback) {
    var nonce, sign;
    var contract = ETH_UTIL.getContract(account);
    contract.call('', 'ProxyController', 'getNonceInOrganizations', [ORGANIZATIONS, account.getAddress()], PROXY_CONTROLLER_ABI, function(err, res) {
        if (err) return callback(err);
        console.log(res);
        nonce = res[0].toString(10);
        account.sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'bytes32', 'uint'], [ORGANIZATIONS, 'createOrganizationWithSign', key, nonce]), function(err, res) {
            if (err) return callback(err);
            console.log(res);
            sign = res;
            contract.sendTransaction('', 'ProxyController', 'createOrganization', [ORGANIZATIONS, key, nonce, sign], PROXY_CONTROLLER_ABI, function(err, res) {
                if (err) return callback(err);
                console.log(res);
                var txHash = res;
                var getTransactionReceipt = function(txHash, cb) {
                    contract.getTransactionReceipt(txHash, function(err, res) {
                        if (err) cb(err);
                        else if (res) addMember(account, key, account.getAddress(), cb);
                        else setTimeout(function() { getTransactionReceipt(txHash, cb); }, 5000);
                    });
                }
                getTransactionReceipt(txHash, callback);
            });
        });
    });
}

var addMember = function(admin, key, member, callback) {
    var nonce, sign;
    var contract = ETH_UTIL.getContract(admin);
    contract.call('', 'ProxyController', 'getNonceInOrganizations', [ORGANIZATIONS, member], PROXY_CONTROLLER_ABI, function(err, res) {
        if (err) return callback(err);
        console.log(res);
        nonce = res[0].toString(10);
        admin.sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'address', 'uint'], [ORGANIZATIONS, 'addMemberWithSign', member, nonce]), function(err, res) {
            if (err) return callback(err);
            console.log(res);
            sign = res;
            contract.sendTransaction('', 'ProxyController', 'addOrganizationMember', [ORGANIZATIONS, member, nonce, sign], PROXY_CONTROLLER_ABI, function(err, res) {
                if (err) return callback(err);
                console.log(res);
                callback();
            });
        });
    });
}

var registerAccount = function(account, callback) {
    if (account) {
        callback(account);
        return;
    }
    ETH_UTIL.generateNewAccount(function(_newAccount) {
        callback(_newAccount);
    });
};
