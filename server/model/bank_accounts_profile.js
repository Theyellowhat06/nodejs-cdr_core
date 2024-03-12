const { Schema, model } = require('mongoose');

const BankAccountsProfileSchema = new Schema({
    first_name: String,
    last_name: String,
    register_number:  String,
    account_number: String,
})

module.exports = model('bank_accounts_profile', BankAccountsProfileSchema)