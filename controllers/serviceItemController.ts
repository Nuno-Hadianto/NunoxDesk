const serviceItemRepository = require('../repositories/serviceItemRepository');

function getServiceItems(serviceOrderId) {
    return serviceItemRepository.getServiceItems(serviceOrderId);
}

function addServiceItem(data) {
    return serviceItemRepository.addServiceItem(data);
}

function deleteServiceItem(id) {
    return serviceItemRepository.deleteServiceItem(id);
}

module.exports = {
    getServiceItems,
    addServiceItem,
    deleteServiceItem
};
