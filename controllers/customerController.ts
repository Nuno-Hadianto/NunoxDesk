import { Customer } from '../src/types';
const customerRepository = require('../repositories/customerRepository');
const { CustomerSchema, validateData } = require('../src/utils/validators');

function getCustomers(searchQuery: string = '', page: number = 1, limit: number = 50) {
    return customerRepository.getCustomers(searchQuery, page, limit);
}

function getCustomerById(id: number | string) {
    return customerRepository.getCustomerById(id);
}

function addCustomer(data: Customer) {
    const validData = validateData(CustomerSchema, data);
    return customerRepository.addCustomer(validData);
}

function updateCustomer(id: number | string, data: Customer) {
    const validData = validateData(CustomerSchema, data);
    return customerRepository.updateCustomer(id, validData);
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
