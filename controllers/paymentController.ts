import { Payment } from '../src/types';
const paymentRepository = require('../repositories/paymentRepository');

function getPaymentsByServiceId(serviceOrderId) {
    return paymentRepository.getPaymentsByServiceId(serviceOrderId);
}

function addPayment(data: Payment) {
    return paymentRepository.addPayment(data);
}

function deletePayment(id: number | string) {
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
