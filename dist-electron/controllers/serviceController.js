"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceRepository = require('../repositories/serviceRepository');
function getServices(searchQuery = '', page = 1, limit = 50) {
    return serviceRepository.getServices(searchQuery, page, limit);
}
function getServiceById(id) {
    return serviceRepository.getServiceById(id);
}
function getServiceStatusHistory(serviceOrderId) {
    return serviceRepository.getServiceStatusHistory(serviceOrderId);
}
function addService(data) {
    return serviceRepository.addService(data);
}
function updateServiceStatus(id, status, notes) {
    return serviceRepository.updateServiceStatus(id, status, notes);
}
function updateServiceDetails(id, data) {
    return serviceRepository.updateServiceDetails(id, data);
}
function deleteService(id) {
    return serviceRepository.deleteService(id);
}
module.exports = {
    getServices,
    getServiceById,
    getServiceStatusHistory,
    addService,
    updateServiceStatus,
    updateServiceDetails,
    deleteService
};
