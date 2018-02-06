$(document).ready(function() {
    refreshPage();
});

var refreshPage = function() {
    var customers = LOCAL_STORAGE.getCustomerFromBankDB();
    for(var i = 0; i < customers.length; i++) {
            addRow(customers[i]);
    }

    if (customers.length > 0) {
        $('#reset-button').css('display', 'block');
    }
};

var addRow = function(customer) {

    var registeredTime = moment(customer.registeredTime);

    var row = $('#customer-row-template div:first').clone(true);
    row.find('div[name="register-id"]').html(customer.registerId);
    row.find('div[name="session-key"]').html(customer.sessionKey.substring(0, 8) + '...').attr('title', customer.sessionKey);
    row.find('div[name="registered-time"]').html(registeredTime.format('MM/DD HH:mm')).attr('title', registeredTime.format('YYYY/MM/DD HH:mm'));

    var personalInformation = customer.personalInformation;
    if (personalInformation) {

        var info = JSON.parse(personalInformation);
        var confirmedTime = moment(customer.confirmedTime);
        var dataExpiresTime = moment(customer.dataExpiresTime);

        row.find('div[name="name"]').html(info.name);
        row.find('div[name="address"]').html(info.address);
        row.find('div[name="gender"]').html(info.gender);
        row.find('div[name="birthday"]').html(info.birthday);
        row.find('div[name="confirmed-time"]').html(confirmedTime.format('MM/DD HH:mm')).attr('title', confirmedTime.format('YYYY/MM/DD HH:mm'));
        row.find('div[name="expires-time"]').html(dataExpiresTime.format('MM/DD HH:mm')).attr('title', dataExpiresTime.format('YYYY/MM/DD HH:mm'));
    }

    $('#customer-list').append(row);
};

var resetDB = function(customer) {
    LOCAL_STORAGE.setCustomerToBankDB([]);
    location.href = "./check-registration.html";
};
