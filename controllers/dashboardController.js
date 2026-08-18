const dashboardRepository = require('../repositories/dashboardRepository');

function getDashboardStats() {
    return dashboardRepository.getDashboardStats();
}

module.exports = {
    getDashboardStats
};
