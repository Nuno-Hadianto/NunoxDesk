"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcMain } = require('electron');
const customerController = require('../../controllers/customerController');
function registerCustomerIpc() {
    ipcMain.handle('get-customers', (event, searchQuery, page, limit) => customerController.getCustomers(searchQuery, page, limit));
    ipcMain.handle('get-customer', (event, id) => customerController.getCustomerById(id));
    ipcMain.handle('add-customer', (event, data) => customerController.addCustomer(data));
    ipcMain.handle('update-customer', (event, id, data) => customerController.updateCustomer(id, data));
    ipcMain.handle('delete-customer', (event, id) => customerController.deleteCustomer(id));
}
module.exports = { registerCustomerIpc };
