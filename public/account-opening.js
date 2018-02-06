$(document).ready(function() {
    prepareCertificationAuthorities(
        function() {
            $('#main-area').css('display', 'block');
        }
    );
});

var openAccount = function() {
    var customers = LOCAL_STORAGE.getCustomerFromBankDB();
    var registerId = (customers.length == 0) ? 1 : (customers[customers.length - 1].registerId + 1);
    var sessionKey = DEMO_UTIL.createRandomId(32);

    customers.push({registerId:registerId, sessionKey:sessionKey, registeredTime:new Date().getTime()});
    LOCAL_STORAGE.setCustomerToBankDB(customers);

    var qrContent = {bankId:'DEMO-BANK-ID', registerId:registerId, sessionKey:sessionKey};

    $("#button").prop("disabled", true);

    $('#qrcode').empty();
    var qrValue = JSON.stringify(qrContent);
    $('#qrcode').qrcode(qrValue);
    $('#qrcode-content').val(qrValue);
    $('#qrcode-content-view').html(JSON.stringify(qrContent, null, '    '));
    $('#qr-area').css('display', 'block');
};

var requestFromClientApplication = function() {

    var personalInformation = LOCAL_STORAGE.getPersonalInformationFromAppLocalDB();

    if (!personalInformation) {
        DEMO_UTIL.okDialog(
            demoMsg('account-opening.dialog.err-not-certificated.title'),
            demoMsg('account-opening.dialog.err-not-certificated.msg')
        );
        return;
    }

    if (DEMO_UTIL.isLoading()) return;
    if (!DEMO_UTIL.startLoad()) return;

    var certificationBodyID = LOCAL_STORAGE.getCertificationBodyID();

    var qr = JSON.parse($('#qrcode-content').val());

    var sendData = JSON.stringify(
        {
            registerId:qr.registerId,
            sessionKey:qr.sessionKey,
            certificationBodyID:certificationBodyID,
            personalInformation:personalInformation
        });
    var sendDataHash = '0x' + ethClient.utils.hash(sendData);

    console.log(sendData);

    var userAccount = LOCAL_STORAGE.getUserAccount();
    var sign;
    userAccount.sign('', sendDataHash, function(err, res) {
        if (err) {
            alert('error');
            console.error(err);
            return;
        }
        sign = res;

        checkOnBankServer(sendData, sign, function(errType, errMsg) {

            DEMO_UTIL.stopLoad();
            if (errType) {
                if (errType == 'expired') {
                    DEMO_UTIL.okDialog(
                        demoMsg('account-opening.dialog.err-expired.title'),
                        demoMsg('account-opening.dialog.err-expired.msg'),
                        function() {
                            location.href = './identity-app.html'
                        }
                    );
                    return;
                }
                alert(errMsg);
                return;
            }

            DEMO_UTIL.okDialog(
                demoMsg('account-opening.dialog.complete.title'),
                demoMsg('account-opening.dialog.complete.msg')
            );
            return;
        });
    });

    $('#qr-area').css('display', 'none');
    $("#button").prop("disabled", false);
};

var checkOnBankServer = function(targetData, sign, callback) {

    var hash = ethClient.utils.hash(targetData);
    var userAddress = ethClient.utils.recoverAddress(hash, sign);

    try {
        var json = JSON.parse(targetData);
        var registerId = json.registerId;
        var sessionKey = json.sessionKey;
        var certificationBodyID = json.certificationBodyID;
        var personalInformation = json.personalInformation;
        // Certification body can decide this key freely.
        var dataKey = 'PERSONAL-DATA';

        if (!registerId || !sessionKey || !certificationBodyID || !personalInformation) throw new Error('invalid parameter');

        // check id and sessionKey
        var customers = LOCAL_STORAGE.getCustomerFromBankDB();
        var customer;
        for(var i = 0; i < customers.length; i++) {
            if (customers[i].registerId == registerId) {
                customer = customers[i];
                break;
            }
        }
        if (!customer) {
            // this will not be happen usually on demo.
            alert('there is no customer for registerId [' + registerId + ']');
            return;
        }
        if (customer.sessionKey != sessionKey) {
            // this will not be happen usually on demo.
            alert('invalid sessionKey expected [' + customer.sessionKey + '] actual sessionKey [' + sessionKey + ']');
            return;
        }

        // check personal information by checking data on blockchain.
        var bankAccount = LOCAL_STORAGE.getBankAccount();
        var contract = ETH_UTIL.getContract(bankAccount);
        contract.call('', 'ProxyController', 'getPersonalInformation', [PERSONAL_INFORMATIONS, userAddress, certificationBodyID, dataKey], PROXY_CONTROLLER_ABI, function(err, res) {
            if (err) {
                console.error(err);
                alert('error');
                return;
            }

            console.log(res);
            if (!res[0]) {
                // this will not be happen usually on demo.
                alert('not yet registered personal information for address [' + userAddress + ']');
                return;
            }

            var dataHash = res[1];
            var hashedPersonalInformation = '0x' + ethClient.utils.hash(personalInformation);
            if (dataHash != hashedPersonalInformation) {
                // this will not be happen usually on demo.
                alert('hash value is not match expected [' + hashedPersonalInformation + '] actual [' + dataHash + ']');
                return;
            }

            var exprires = res[2];
            var dt = new Date();
            if (dt.getTime() > exprires) {
                console.error('expire');
                callback('expired');
                return;
            }

            // this flow save only the necessary data here, but with true service bank should save the user's whole request data.

            customer.personalInformation = personalInformation;
            customer.confirmedTime = new Date().getTime();
            customer.dataExpiresTime = Number(exprires);
            LOCAL_STORAGE.setCustomerToBankDB(customers);
            callback();
            return;
        });

    } catch (err) {
        callback(null, null, 'failed to save certification data');
        console.error(err);
    }
};
