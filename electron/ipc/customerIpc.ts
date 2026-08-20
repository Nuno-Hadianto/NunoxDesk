const { ipcMain } = require('electron');
const customerController = require('../../controllers/customerController');

function registerCustomerIpc() {
  ipcMain.handle('get-customers', (event: any, searchQuery: string, page: number, limit: number) => customerController.getCustomers(searchQuery, page, limit));
  ipcMain.handle('get-customer', (event: any, id: number) => customerController.getCustomerById(id));
  ipcMain.handle('add-customer', (event: any, data: any) => customerController.addCustomer(data));
  ipcMain.handle('update-customer', (event: any, id: number, data: any) => customerController.updateCustomer(id, data));
  ipcMain.handle('delete-customer', (event: any, id: number) => customerController.deleteCustomer(id));
}

module.exports = { registerCustomerIpc };
