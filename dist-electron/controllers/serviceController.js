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
function updateServiceStatus(id, status, notes, warrantyDays = 0) {
    return serviceRepository.updateServiceStatus(id, status, notes, warrantyDays);
}
function updateServiceDetails(id, data) {
    // For update details, some fields might not be present (like customer_id), so we should use partial validation
    const validData = validateData(ServiceOrderSchema.partial(), data);
    return serviceRepository.updateServiceDetails(id, validData);
}
function deleteService(id) {
    return serviceRepository.deleteService(id);
}
function addPhoto(serviceOrderId, photoType, filepath) {
    return serviceRepository.addPhoto(serviceOrderId, photoType, filepath);
}
function getPhotos(serviceOrderId) {
    return serviceRepository.getPhotos(serviceOrderId);
}
function deletePhoto(id) {
    // maybe we should delete the file from disk here too, or in IPC handler. 
    // IPC handler will call deletePhoto from disk.
    return serviceRepository.deletePhoto(id);
}
function getPhotoById(id) {
    return serviceRepository.getPhotoById(id);
}
function checkWarranty(deviceId) {
    return serviceRepository.checkWarranty(deviceId);
}
module.exports = {
    getServices,
    getServiceById,
    getServiceStatusHistory,
    addService,
    updateServiceStatus,
    updateServiceDetails,
    deleteService,
    addPhoto,
    getPhotos,
    deletePhoto,
    getPhotoById,
    checkWarranty
};
