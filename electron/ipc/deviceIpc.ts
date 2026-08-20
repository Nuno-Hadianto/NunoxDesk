const { ipcMain } = require('electron');
const deviceController = require('../../controllers/deviceController');

function registerDeviceIpc() {
  ipcMain.handle('get-devices', (event, searchQuery) => deviceController.getDevices(searchQuery));
  ipcMain.handle('get-device', (event, id) => deviceController.getDeviceById(id));
  ipcMain.handle('get-devices-by-customer', (event, customerId) => deviceController.getDevicesByCustomerId(customerId));
  ipcMain.handle('add-device', (event, data) => deviceController.addDevice(data));
  ipcMain.handle('update-device', (event, id, data) => deviceController.updateDevice(id, data));
  ipcMain.handle('delete-device', (event, id) => deviceController.deleteDevice(id));
}

module.exports = { registerDeviceIpc };
