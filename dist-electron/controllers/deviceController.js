"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deviceRepository = require('../repositories/deviceRepository');
const { DeviceSchema, validateData } = require('../src/utils/validators');
function getDevices(searchQuery = '') {
    return deviceRepository.getDevices(searchQuery);
}
function getDeviceById(id) {
    return deviceRepository.getDeviceById(id);
}
function getDevicesByCustomerId(customerId) {
    return deviceRepository.getDevicesByCustomerId(customerId);
}
function addDevice(data) {
    const validData = validateData(DeviceSchema, data);
    return deviceRepository.addDevice(validData);
}
function updateDevice(id, data) {
    const validData = validateData(DeviceSchema, data);
    return deviceRepository.updateDevice(id, validData);
}
function deleteDevice(id) {
    const hasServiceOrders = deviceRepository.checkDeviceHasServiceOrders(id);
    if (hasServiceOrders) {
        throw new Error("Perangkat tidak bisa dihapus karena masih memiliki riwayat tiket servis.");
    }
    return deviceRepository.deleteDevice(id);
}
module.exports = {
    getDevices,
    getDeviceById,
    getDevicesByCustomerId,
    addDevice,
    updateDevice,
    deleteDevice
};
