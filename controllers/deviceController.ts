const deviceRepository = require('../repositories/deviceRepository');

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
    return deviceRepository.addDevice(data);
}

function updateDevice(id, data) {
    return deviceRepository.updateDevice(id, data);
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
