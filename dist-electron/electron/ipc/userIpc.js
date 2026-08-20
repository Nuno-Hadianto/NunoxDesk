"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcMain } = require('electron');
const userController = require('../../controllers/userController');
function registerUserIpc() {
    ipcMain.handle('login', (event, username, password) => {
        try {
            return { success: true, user: userController.login(username, password) };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    ipcMain.handle('get-users', () => userController.getUsers());
    ipcMain.handle('get-user', (event, id) => userController.getUserById(id));
    ipcMain.handle('add-user', (event, data) => {
        try {
            return { success: true, id: userController.addUser(data) };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    ipcMain.handle('update-user', (event, id, data) => {
        try {
            return { success: true, result: userController.updateUser(id, data) };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    ipcMain.handle('delete-user', (event, id) => {
        try {
            return { success: true, result: userController.deleteUser(id) };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
}
module.exports = { registerUserIpc };
