import { ServiceOrder } from '../src/types';
const serviceRepository = require('../repositories/serviceRepository');
const { ServiceOrderSchema, validateData } = require('../src/utils/validators');

function getServices(searchQuery: string = '', page: number = 1, limit: number = 50) {
    return serviceRepository.getServices(searchQuery, page, limit);
}

function getServiceById(id: number | string) {
    return serviceRepository.getServiceById(id);
}

function getServiceByTicketNumber(ticketNumber: string) {
    return serviceRepository.getServiceByTicketNumber(ticketNumber);
}

function getServiceStatusHistory(serviceOrderId: any) {
    return serviceRepository.getServiceStatusHistory(serviceOrderId);
}

function addService(data: ServiceOrder) {
    // Make sure we only validate the keys that matter for creation, or partial validation
    // because estimated_cost might be missing on creation.
    // wait, Zod schema has default(0) for estimated_cost.
    const validData = validateData(ServiceOrderSchema, data);
    return serviceRepository.addService(validData);
}

function updateServiceStatus(id: any, status: any, notes: any, warrantyDays: any = 0) {
    return serviceRepository.updateServiceStatus(id, status, notes, warrantyDays);
}

function updateServiceDetails(id: number | string, data: ServiceOrder) {
    // For update details, some fields might not be present (like customer_id), so we should use partial validation
    const validData = validateData(ServiceOrderSchema.partial(), data);
    return serviceRepository.updateServiceDetails(id, validData);
}

function deleteService(id: number | string) {
    return serviceRepository.deleteService(id);
}

function addPhoto(serviceOrderId: any, photoType: any, filepath: any) {
    return serviceRepository.addPhoto(serviceOrderId, photoType, filepath);
}

function getPhotos(serviceOrderId: any) {
    return serviceRepository.getPhotos(serviceOrderId);
}

function deletePhoto(id: any) {
    // maybe we should delete the file from disk here too, or in IPC handler. 
    // IPC handler will call deletePhoto from disk.
    return serviceRepository.deletePhoto(id);
}

function getPhotoById(id: any) {
    return serviceRepository.getPhotoById(id);
}

function checkWarranty(deviceId: any) {
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
