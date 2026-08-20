"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceItemRepository = require('../repositories/serviceItemRepository');
const { ServiceItemSchema, validateData } = require('../src/utils/validators');
function getServiceItems(serviceOrderId) {
    return serviceItemRepository.getServiceItems(serviceOrderId);
}
function addServiceItem(data) {
    const validData = validateData(ServiceItemSchema, data);
    return serviceItemRepository.addServiceItem(validData);
}
function deleteServiceItem(id) {
    return serviceItemRepository.deleteServiceItem(id);
}
module.exports = {
    getServiceItems,
    addServiceItem,
    deleteServiceItem
};
