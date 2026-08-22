export {};
const { ipcMain } = require('electron');
const userController = require('../../controllers/userController');
const log = require('electron-log');

function registerUserIpc() {
  ipcMain.handle('login', (event: any, username: any, password: any) => {
    try { return { success: true, user: userController.login(username, password) }; }
    catch (err: any) { 
      log.error('Error in login:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('get-users', () => userController.getUsers());
  ipcMain.handle('get-user', (event: any, id: any) => userController.getUserById(id));
  ipcMain.handle('add-user', (event: any, data: any) => {
    try { return { success: true, id: userController.addUser(data) }; }
    catch (err: any) { 
      log.error('Error in add-user:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('update-user', (event: any, id: any, data: any) => {
    try { return { success: true, result: userController.updateUser(id, data) }; }
    catch (err: any) { 
      log.error('Error in update-user:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('delete-user', (event: any, id: any) => {
    try { return { success: true, result: userController.deleteUser(id) }; }
    catch (err: any) { 
      log.error('Error in delete-user:', err);
      return { success: false, error: err.message }; 
    }
  });
}

module.exports = { registerUserIpc };
