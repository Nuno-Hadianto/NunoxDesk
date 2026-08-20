import { Payment } from '../src/types';
const paymentRepository = require('../repositories/paymentRepository');
const { PaymentSchema, validateData } = require('../src/utils/validators');

function getPaymentsByServiceId(serviceOrderId) {
    return paymentRepository.getPaymentsByServiceId(serviceOrderId);
}

function addPayment(data: Payment) {
    const validData = validateData(PaymentSchema, data);
    return paymentRepository.addPayment(validData);
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
