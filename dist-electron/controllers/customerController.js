"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customerRepository = require('../repositories/customerRepository');
const { CustomerSchema, validateData } = require('../src/utils/validators');
function getCustomers(searchQuery = '', page = 1, limit = 50) {
    return customerRepository.getCustomers(searchQuery, page, limit);
}
function getCustomerById(id) {
    return customerRepository.getCustomerById(id);
}
function addCustomer(data) {
    const validData = validateData(CustomerSchema, data);
    return customerRepository.addCustomer(validData);
}
function updateCustomer(id, data) {
    const validData = validateData(CustomerSchema, data);
    return customerRepository.updateCustomer(id, validData);
}
function deleteCustomer(id) {
    const hasServiceOrders = customerRepository.checkCustomerHasServiceOrders(id);
    if (hasServiceOrders) {
        throw new Error("Pelanggan tidak bisa dihapus karena masih memiliki riwayat tiket servis.");
    }
    return customerRepository.deleteCustomer(id);
}
module.exports = {
    getCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer
};
