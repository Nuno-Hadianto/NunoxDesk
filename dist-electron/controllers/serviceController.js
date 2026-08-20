"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceRepository = require('../repositories/serviceRepository');
const { ServiceOrderSchema, validateData } = require('../src/utils/validators');
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
    // Make sure we only validate the keys that matter for creation, or partial validation
    // because estimated_cost might be missing on creation.
    // wait, Zod schema has default(0) for estimated_cost.
    const validData = validateData(ServiceOrderSchema, data);
    return serviceRepository.addService(validData);
}
function updateServiceStatus(id, status, notes) {
    return serviceRepository.updateServiceStatus(id, status, notes);
}
function updateServiceDetails(id, data) {
    // For update details, some fields might not be present (like customer_id), so we should use partial validation
    const validData = validateData(ServiceOrderSchema.partial(), data);
    return serviceRepository.updateServiceDetails(id, validData);
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
