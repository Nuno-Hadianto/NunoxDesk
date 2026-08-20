import { ServiceItem } from '../src/types';
const serviceItemRepository = require('../repositories/serviceItemRepository');
const { ServiceItemSchema, validateData } = require('../src/utils/validators');

function getServiceItems(serviceOrderId) {
    return serviceItemRepository.getServiceItems(serviceOrderId);
}

function addServiceItem(data: ServiceItem) {
    const validData = validateData(ServiceItemSchema, data);
    return serviceItemRepository.addServiceItem(validData);
}

function deleteServiceItem(id: number | string) {
    return serviceItemRepository.deleteServiceItem(id);
}

module.exports = {
    getServiceItems,
    addServiceItem,
    deleteServiceItem
};
