export {};
const { ipcMain } = require('electron');
const saleController = require('../../controllers/saleController');

function registerSaleIpc(mainWindow: any) {
  ipcMain.handle('create-sale', (event: any, saleData: any, items: any[]) => {
    try {
      const saleId = saleController.createSale(saleData, items);
      return { success: true, saleId };
    } catch (error: any) {
      console.error('Error in createSale:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-sales', (event: any, startDate?: string, endDate?: string) => {
    try {
      return saleController.getSales(startDate, endDate);
    } catch (error: any) {
      console.error('Error in getSales:', error);
      return [];
    }
  });

  ipcMain.handle('get-sale-items', (event: any, saleId: number | string) => {
    try {
      return saleController.getSaleItems(saleId);
    } catch (error: any) {
      console.error('Error in getSaleItems:', error);
      return [];
    }
  });
}

module.exports = registerSaleIpc;
