var LOCAL_STORAGE = {};

var _prefix = 'kyc.v0.';

var _certificationBodyAccountKey = _prefix + 'certification-body-account';
var _certificationBodyIDKey = _prefix + 'certification-body-id';
var _bankAccountKey = _prefix + 'bank-account';
var _userAccountKey = _prefix + 'user-account';
var _personalInformationAppLocalDBKey = _prefix + 'app-local.db.personal-information';
var _customerBankDBKey = _prefix + 'bank.db.customers';

LOCAL_STORAGE.getCertificationBodyAccount = function () {
    var serializedAccount = localStorage.getItem(_certificationBodyAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setCertificationBodyAccount = function (_account) {
    localStorage.setItem(_certificationBodyAccountKey, _account.serialize());
};

LOCAL_STORAGE.getCertificationBodyID = function () {
    return localStorage.getItem(_certificationBodyIDKey);
};
LOCAL_STORAGE.setCertificationBodyID = function (_id) {
    localStorage.setItem(_certificationBodyIDKey, _id);
};

LOCAL_STORAGE.getBankAccount = function () {
    var serializedAccount = localStorage.getItem(_bankAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setBankAccount = function (_account) {
    localStorage.setItem(_bankAccountKey, _account.serialize());
};

LOCAL_STORAGE.getUserAccount = function () {
    var serializedAccount = localStorage.getItem(_userAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setUserAccount = function (_account) {
    localStorage.setItem(_userAccountKey, _account.serialize());
};

LOCAL_STORAGE.setPersonalInformationToAppLocalDB = function(personalInformation) {
    localStorage.setItem(_personalInformationAppLocalDBKey, personalInformation);
}
LOCAL_STORAGE.getPersonalInformationFromAppLocalDB = function() {
    return localStorage.getItem(_personalInformationAppLocalDBKey);
}

LOCAL_STORAGE.getCustomerFromBankDB = function () {
    var a = JSON.parse(localStorage.getItem(_customerBankDBKey));
    return a ? a: [];
};
LOCAL_STORAGE.setCustomerToBankDB = function (_jsonValue) {
    localStorage.setItem(_customerBankDBKey, JSON.stringify(_jsonValue));
};
