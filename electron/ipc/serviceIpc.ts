const { ipcMain } = require('electron');
const serviceController = require('../../controllers/serviceController');
const serviceItemController = require('../../controllers/serviceItemController');

function registerServiceIpc() {
  ipcMain.handle('get-services', (event: any, searchQuery: any, page: any, limit: any) => serviceController.getServices(searchQuery, page, limit));
  ipcMain.handle('get-service', (event: any, id: any) => serviceController.getServiceById(id));
  ipcMain.handle('get-service-by-ticket', (event: any, ticketNumber: string) => serviceController.getServiceByTicketNumber(ticketNumber));
  ipcMain.handle('get-service-history', (event: any, id: any) => serviceController.getServiceStatusHistory(id));
  ipcMain.handle('add-service', (event: any, data: any) => serviceController.addService(data));
  ipcMain.handle('update-service-status', (event: any, id: any, status: any, notes: any, warrantyDays: any = 0) => serviceController.updateServiceStatus(id, status, notes, warrantyDays));
  ipcMain.handle('update-service-details', (event: any, id: any, data: any) => serviceController.updateServiceDetails(id, data));
  ipcMain.handle('delete-service', (event: any, id: any) => serviceController.deleteService(id));

  // Service Items
  ipcMain.handle('get-service-items', (event: any, serviceId: any) => serviceItemController.getServiceItems(serviceId));
  ipcMain.handle('add-service-item', (event: any, data: any) => serviceItemController.addServiceItem(data));
  ipcMain.handle('delete-service-item', (event: any, id: any) => serviceItemController.deleteServiceItem(id));

  // Warranty
  ipcMain.handle('check-warranty', (event: any, deviceId: any) => serviceController.checkWarranty(deviceId));

  // Photos
  const fs = require('fs');
  const path = require('path');
  const { app } = require('electron');

  ipcMain.handle('upload-photo', async (event: any, serviceId: any, type: any, buffer: any, fileName: any) => {
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

  ipcMain.handle('get-photos', (event: any, serviceId: any) => serviceController.getPhotos(serviceId));

  ipcMain.handle('delete-photo', (event: any, id: any) => {
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

export {};
