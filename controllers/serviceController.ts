import { ServiceOrder } from '../src/types';
const serviceRepository = require('../repositories/serviceRepository');

function getServices(searchQuery: string = '', page: number = 1, limit: number = 50) {
    return serviceRepository.getServices(searchQuery, page, limit);
}

function getServiceById(id: number | string) {
    return serviceRepository.getServiceById(id);
}

function getServiceStatusHistory(serviceOrderId) {
    return serviceRepository.getServiceStatusHistory(serviceOrderId);
}

function addService(data: ServiceOrder) {
    return serviceRepository.addService(data);
}

function updateServiceStatus(id, status, notes) {
    return serviceRepository.updateServiceStatus(id, status, notes);
}

function updateServiceDetails(id: number | string, data: ServiceOrder) {
    return serviceRepository.updateServiceDetails(id, data);
}

function deleteService(id: number | string) {
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
