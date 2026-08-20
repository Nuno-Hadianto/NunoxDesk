"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcMain } = require('electron');
const saleController = require('../../controllers/saleController');
function registerSaleIpc(mainWindow) {
    ipcMain.handle('create-sale', (event, saleData, items) => {
        try {
            const saleId = saleController.createSale(saleData, items);
            return { success: true, saleId };
        }
        catch (error) {
            console.error('Error in createSale:', error);
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle('get-sales', (event, startDate, endDate) => {
        try {
            return saleController.getSales(startDate, endDate);
        }
        catch (error) {
            console.error('Error in getSales:', error);
            return [];
        }
    });
    ipcMain.handle('get-sale-items', (event, saleId) => {
        try {
            return saleController.getSaleItems(saleId);
        }
        catch (error) {
            console.error('Error in getSaleItems:', error);
            return [];
        }
    });
}
module.exports = registerSaleIpc;
