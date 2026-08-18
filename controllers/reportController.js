const reportRepository = require('../repositories/reportRepository');

function getIncomeReport(startDate, endDate) {
    return reportRepository.getIncomeReport(startDate, endDate);
}

function getCompletedServices(startDate, endDate) {
    return reportRepository.getCompletedServices(startDate, endDate);
}

module.exports = {
    getIncomeReport,
    getCompletedServices
};
