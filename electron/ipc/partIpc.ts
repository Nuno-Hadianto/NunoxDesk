const { ipcMain, dialog } = require('electron');
const xlsx = require('xlsx');
const partController = require('../../controllers/partController');
const log = require('electron-log');

function registerPartIpc(mainWindow: any) {
  ipcMain.handle('get-parts', (event: any, searchQuery: any) => partController.getParts(searchQuery));
  ipcMain.handle('get-part', (event: any, id: any) => partController.getPartById(id));
  ipcMain.handle('add-part', (event: any, data: any) => partController.addPart(data));
  ipcMain.handle('update-part', (event: any, id: any, data: any) => partController.updatePart(id, data));
  ipcMain.handle('update-part-stock', (event: any, id: any, change: any) => partController.updatePartStock(id, change));
  ipcMain.handle('delete-part', (event: any, id: any) => partController.deletePart(id));
  ipcMain.handle('get-low-stock-parts', (event: any, threshold: any) => partController.getLowStockParts(threshold));

  ipcMain.handle('import-parts-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Pilih File Excel Sparepart',
        filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) return { success: false, canceled: true };

      const filePath = filePaths[0];
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (data.length === 0) {
        return { success: false, error: 'File Excel kosong atau format tidak sesuai.' };
      }

      const result = partController.importParts(data);
      return { success: true, result };
    } catch (error: any) {
      log.error('Error importing excel:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerPartIpc };
