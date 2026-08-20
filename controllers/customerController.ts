import { Customer } from '../src/types';
const customerRepository = require('../repositories/customerRepository');

function getCustomers(searchQuery: string = '', page: number = 1, limit: number = 50) {
    return customerRepository.getCustomers(searchQuery, page, limit);
}

function getCustomerById(id: number | string) {
    return customerRepository.getCustomerById(id);
}

function addCustomer(data: Customer) {
    return customerRepository.addCustomer(data);
}

function updateCustomer(id: number | string, data: Customer) {
    return customerRepository.updateCustomer(id, data);
}

function deleteCustomer(id: number | string) {
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
