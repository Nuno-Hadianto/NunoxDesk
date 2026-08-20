const { ipcMain } = require('electron');
const serviceController = require('../../controllers/serviceController');
const serviceItemController = require('../../controllers/serviceItemController');

function registerServiceIpc() {
  ipcMain.handle('get-services', (event, searchQuery, page, limit) => serviceController.getServices(searchQuery, page, limit));
  ipcMain.handle('get-service', (event, id) => serviceController.getServiceById(id));
  ipcMain.handle('get-service-history', (event, id) => serviceController.getServiceStatusHistory(id));
  ipcMain.handle('add-service', (event, data) => serviceController.addService(data));
  ipcMain.handle('update-service-status', (event, id, status, notes, warrantyDays = 0) => serviceController.updateServiceStatus(id, status, notes, warrantyDays));
  ipcMain.handle('update-service-details', (event, id, data) => serviceController.updateServiceDetails(id, data));
  ipcMain.handle('delete-service', (event, id) => serviceController.deleteService(id));

  // Service Items
  ipcMain.handle('get-service-items', (event, serviceId) => serviceItemController.getServiceItems(serviceId));
  ipcMain.handle('add-service-item', (event, data) => serviceItemController.addServiceItem(data));
  ipcMain.handle('delete-service-item', (event, id) => serviceItemController.deleteServiceItem(id));

  // Warranty
  ipcMain.handle('check-warranty', (event, deviceId) => serviceController.checkWarranty(deviceId));

  // Photos
  const fs = require('fs');
  const path = require('path');
  const { app } = require('electron');

  ipcMain.handle('upload-photo', async (event, serviceId, type, buffer, fileName) => {
    try {
      const photosDir = path.join(app.getPath('userData'), 'photos');
      const uniqueName = Date.now() + '_' + fileName;
      const filepath = path.join(photosDir, uniqueName);
      
      fs.writeFileSync(filepath, Buffer.from(buffer));
      
      const id = serviceController.addPhoto(serviceId, type, filepath);
      return { success: true, id, filepath };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-photos', (event, serviceId) => serviceController.getPhotos(serviceId));

  ipcMain.handle('delete-photo', (event, id) => {
    const photo = serviceController.getPhotoById(id);
    if (photo && photo.filepath) {
      try {
        fs.unlinkSync(photo.filepath);
      } catch (e) {
        console.error("Failed to delete photo from disk:", e);
      }
    }
    return serviceController.deletePhoto(id);
  });
}

module.exports = { registerServiceIpc };
