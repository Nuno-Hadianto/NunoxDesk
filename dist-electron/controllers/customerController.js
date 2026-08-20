"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customerRepository = require('../repositories/customerRepository');
function getCustomers(searchQuery = '', page = 1, limit = 50) {
    return customerRepository.getCustomers(searchQuery, page, limit);
}
function getCustomerById(id) {
    return customerRepository.getCustomerById(id);
}
function addCustomer(data) {
    return customerRepository.addCustomer(data);
}
function updateCustomer(id, data) {
    return customerRepository.updateCustomer(id, data);
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
