import { Device } from '../src/types';
const deviceRepository = require('../repositories/deviceRepository');

function getDevices(searchQuery = '') {
    return deviceRepository.getDevices(searchQuery);
}

function getDeviceById(id: number | string) {
    return deviceRepository.getDeviceById(id);
}

function getDevicesByCustomerId(customerId) {
    return deviceRepository.getDevicesByCustomerId(customerId);
}

function addDevice(data: Device) {
    return deviceRepository.addDevice(data);
}

function updateDevice(id: number | string, data: Device) {
    return deviceRepository.updateDevice(id, data);
}

function deleteDevice(id: number | string) {
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
