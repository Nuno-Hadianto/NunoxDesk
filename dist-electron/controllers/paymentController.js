"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paymentRepository = require('../repositories/paymentRepository');
const { PaymentSchema, validateData } = require('../src/utils/validators');
function getPaymentsByServiceId(serviceOrderId) {
    return paymentRepository.getPaymentsByServiceId(serviceOrderId);
}
function addPayment(data) {
    const validData = validateData(PaymentSchema, data);
    return paymentRepository.addPayment(validData);
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
