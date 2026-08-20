"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paymentRepository = require('../repositories/paymentRepository');
function getPaymentsByServiceId(serviceOrderId) {
    return paymentRepository.getPaymentsByServiceId(serviceOrderId);
}
function addPayment(data) {
    return paymentRepository.addPayment(data);
}
function deletePayment(id) {
    return paymentRepository.deletePayment(id);
}
function updateServicePaymentStatus(serviceOrderId) {
    return paymentRepository.updateServicePaymentStatus(serviceOrderId);
}
module.exports = {
    getPaymentsByServiceId,
    addPayment,
    deletePayment,
    updateServicePaymentStatus
};
