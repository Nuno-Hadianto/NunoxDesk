"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reportRepository = require('../repositories/reportRepository');
function getIncomeReport(startDate, endDate) {
    return reportRepository.getIncomeReport(startDate, endDate);
}
function getCompletedServices(startDate, endDate) {
    return reportRepository.getCompletedServices(startDate, endDate);
}
function getTopSpareparts(startDate, endDate) {
    return reportRepository.getTopSpareparts(startDate, endDate);
}
module.exports = {
    getIncomeReport,
    getCompletedServices,
    getTopSpareparts
};
