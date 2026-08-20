import { ServiceItem } from '../src/types';
const serviceItemRepository = require('../repositories/serviceItemRepository');

function getServiceItems(serviceOrderId) {
    return serviceItemRepository.getServiceItems(serviceOrderId);
}

function addServiceItem(data: ServiceItem) {
    return serviceItemRepository.addServiceItem(data);
}

function deleteServiceItem(id: number | string) {
    return serviceItemRepository.deleteServiceItem(id);
}

module.exports = {
    getServiceItems,
    addServiceItem,
    deleteServiceItem
};
