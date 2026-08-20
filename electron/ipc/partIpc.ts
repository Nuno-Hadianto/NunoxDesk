const { ipcMain, dialog } = require('electron');
const xlsx = require('xlsx');
const partController = require('../../controllers/partController');

function registerPartIpc(mainWindow) {
  ipcMain.handle('get-parts', (event, searchQuery) => partController.getParts(searchQuery));
  ipcMain.handle('get-part', (event, id) => partController.getPartById(id));
  ipcMain.handle('add-part', (event, data) => partController.addPart(data));
  ipcMain.handle('update-part', (event, id, data) => partController.updatePart(id, data));
  ipcMain.handle('update-part-stock', (event, id, change) => partController.updatePartStock(id, change));
  ipcMain.handle('delete-part', (event, id) => partController.deletePart(id));

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
    } catch (error) {
      console.error('Error importing excel:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerPartIpc };
