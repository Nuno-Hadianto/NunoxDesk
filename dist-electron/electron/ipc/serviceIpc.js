"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcMain } = require('electron');
const serviceController = require('../../controllers/serviceController');
const serviceItemController = require('../../controllers/serviceItemController');
function registerServiceIpc() {
    ipcMain.handle('get-services', (event, searchQuery, page, limit) => serviceController.getServices(searchQuery, page, limit));
    ipcMain.handle('get-service', (event, id) => serviceController.getServiceById(id));
    ipcMain.handle('get-service-history', (event, id) => serviceController.getServiceStatusHistory(id));
    ipcMain.handle('add-service', (event, data) => serviceController.addService(data));
    ipcMain.handle('update-service-status', (event, id, status, notes) => serviceController.updateServiceStatus(id, status, notes));
    ipcMain.handle('update-service-details', (event, id, data) => serviceController.updateServiceDetails(id, data));
    ipcMain.handle('delete-service', (event, id) => serviceController.deleteService(id));
    // Service Items
    ipcMain.handle('get-service-items', (event, serviceId) => serviceItemController.getServiceItems(serviceId));
    ipcMain.handle('add-service-item', (event, data) => serviceItemController.addServiceItem(data));
    ipcMain.handle('delete-service-item', (event, id) => serviceItemController.deleteServiceItem(id));
}
module.exports = { registerServiceIpc };
