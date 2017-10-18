$(document).ready(function() {

    if ("ja" == localStorage.getItem('_lang')) {
        $(".flatpickr-datetime").flatpickr({ enableTime: false, locale: "ja" });
    } else {
        $(".flatpickr-datetime").flatpickr({ enableTime: false });
    }
    prepareCertificationAuthorities(
        function() {
            $('#main-area').css('display', 'block');
            var personalInformationStr = LOCAL_STORAGE.getPersonalInformationFromAppLocalDB();
            if (personalInformationStr) {
                var personalInformation = JSON.parse(personalInformationStr);
                $('#personal-information-name').val(personalInformation.name);
                $('#personal-information-address').val(personalInformation.address);
                $('#personal-information-gender').val(personalInformation.gender);
                $('#personal-information-birthday').val(personalInformation.birthday);
            }
        }
    );
});

var requestFromClientApplication = function() {

    if (DEMO_UTIL.isLoading()) return;
    if (!DEMO_UTIL.startLoad()) return;

    var name = $('#personal-information-name').val().trim();
    var address = $('#personal-information-address').val().trim();
    var gender = $('#personal-information-gender').val().trim();
    var birthday = $('#personal-information-birthday').val().trim();

    // validate(very simple for DEMO)
    if (!name || !address || !gender || !birthday) {
        DEMO_UTIL.okDialog(
            demoMsg('common.dialog.err-required.title'),
            demoMsg('common.dialog.err-required.msg')
        );
        return DEMO_UTIL.stopLoad();
    }

    var personalInformation = JSON.stringify({ name: name, address: address, gender: gender, birthday: birthday });
    var hashedPersonalInformation = ethClient.utils.hash(personalInformation);
    var sign;

    var userAccount = LOCAL_STORAGE.getUserAccount();

    userAccount.sign('', hashedPersonalInformation, function(err, res) {
        if (err) {
            alert('error');
            console.error(err);
            return;
        }
        sign = res;

        certificateOnCertificatorServer(personalInformation, sign, function(certificatedData, certificatedDataHash, err) {

            DEMO_UTIL.stopLoad();
            if (err) {
                alert(err);
                return;
            }

            if (certificatedData && certificatedDataHash) {
                var hash = '0x' + ethClient.utils.hash(certificatedData);
                if (hash != certificatedDataHash) {
                    alert('Hash value not matched!');
                    return;
                }

                LOCAL_STORAGE.setPersonalInformationToAppLocalDB(certificatedData);
                DEMO_UTIL.okDialog(
                    demoMsg('identity-app.dialog.complete.title'),
                    demoMsg('identity-app.dialog.complete.msg')
                );
                return;
            } else {
                alert('unexpected error occured! check browser console!');
                return;
            }
        });
    });
};

var certificateOnCertificatorServer = function(personalInformation, sign, callback) {

    var hash = ethClient.utils.hash(personalInformation);
    var userAddress = ethClient.utils.recoverAddress(hash, sign);

    try {
        var json = JSON.parse(personalInformation);
        var name = json.name;
        var address = json.address;
        var gender = json.gender;
        var birthday = json.birthday;
        if (!name || !address || !gender || !birthday) throw new Error('invalid parameter');

        // To make the hash value obscure.
        var salt = DEMO_UTIL.createRandomId(32);

        var dataObj = { salt: salt, name: name, address: address, gender: gender, birthday: birthday };
        var targetData = JSON.stringify(dataObj);
        var targetDataHash = '0x' + ethClient.utils.hash(targetData);

        // Register immediately to the blockchain. (Because this is a demonstration)
        console.log(targetData);
        certificate(userAddress, targetData, targetDataHash, function(targetData, targetDataHash){
            callback(targetData, targetDataHash);
        });

    } catch (err) {
        callback(null, null, 'failed to save certification data');
        console.error(err);
    }
};

var certificate = function(userAddress, targetData, targetDataHash, callback) {

    var certificationBodyAccount = LOCAL_STORAGE.getCertificationBodyAccount();
    var certificationBodyID = LOCAL_STORAGE.getCertificationBodyID();
    var contract = ETH_UTIL.getContract(certificationBodyAccount);

    // 15 min for expires. (Because this is a demonstration)
    var expires = new Date().getTime() + 15 * 60 * 1000;
    // Certification body can decide this key freely.
    var dataKey = 'PERSONAL-DATA';

    var nonce, sign;

    contract.call('', 'ProxyController', 'getNonceInPersonalInformations', [PERSONAL_INFORMATIONS, certificationBodyAccount.getAddress()], PROXY_CONTROLLER_ABI, function(err, res) {
        if (err) {
            console.error(err);
            alert('error');
            return;
        }
        console.log(res);
        nonce = res[0].toString(10);

        contract.call('', 'ProxyController', 'getPersonalInformation', [PERSONAL_INFORMATIONS, userAddress, certificationBodyID, dataKey], PROXY_CONTROLLER_ABI, function(err, res) {
            if (err) {
                console.error(err);
                alert('error');
                return;
            }

            console.log(res);
            if (res[0]) {

                // update
                certificationBodyAccount.sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'address', 'bytes32', 'bytes32', 'uint', 'uint'], [PERSONAL_INFORMATIONS, 'updateWithSign', userAddress, dataKey, targetDataHash, expires, nonce]), function(err, res) {
                    if (err) {
                        console.error(err);
                        alert('error');
                        return;
                    }
                    console.log(res);
                    sign = res;
                    contract.sendTransaction('', 'ProxyController', 'updatePersonalInformation', [PERSONAL_INFORMATIONS, userAddress, dataKey, targetDataHash, expires, nonce, sign], PROXY_CONTROLLER_ABI, function(err, res) {
                        if (err) {
                            console.error(err);
                            alert('error');
                            return;
                        }
                        console.log(res);
                        callback(targetData, targetDataHash);
                    });
                });

            } else {

                // create new
                certificationBodyAccount.sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'address', 'bytes32', 'bytes32', 'uint', 'uint'], [PERSONAL_INFORMATIONS, 'createWithSign', userAddress, dataKey, targetDataHash, expires, nonce]), function(err, res) {
                    if (err) {
                        console.error(err);
                        alert('error');
                        return;
                    }
                    console.log(res);
                    sign = res;
                    contract.sendTransaction('', 'ProxyController', 'createPersonalInformation', [PERSONAL_INFORMATIONS, userAddress, dataKey, targetDataHash, expires, nonce, sign], PROXY_CONTROLLER_ABI, function(err, res) {
                        if (err) {
                            console.error(err);
                            alert('error');
                            return;
                        }
                        console.log(res);
                        callback(targetData, targetDataHash);
                    });
                });

            }
        })
    });
};
