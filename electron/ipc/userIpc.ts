const { ipcMain } = require('electron');
const userController = require('../../controllers/userController');
const log = require('electron-log');

function registerUserIpc() {
  ipcMain.handle('login', (event, username, password) => {
    try { return { success: true, user: userController.login(username, password) }; }
    catch (err) { 
      log.error('Error in login:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('get-users', () => userController.getUsers());
  ipcMain.handle('get-user', (event, id) => userController.getUserById(id));
  ipcMain.handle('add-user', (event, data) => {
    try { return { success: true, id: userController.addUser(data) }; }
    catch (err) { 
      log.error('Error in add-user:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('update-user', (event, id, data) => {
    try { return { success: true, result: userController.updateUser(id, data) }; }
    catch (err) { 
      log.error('Error in update-user:', err);
      return { success: false, error: err.message }; 
    }
  });
  ipcMain.handle('delete-user', (event, id) => {
    try { return { success: true, result: userController.deleteUser(id) }; }
    catch (err) { 
      log.error('Error in delete-user:', err);
      return { success: false, error: err.message }; 
    }
  });
}

module.exports = { registerUserIpc };
