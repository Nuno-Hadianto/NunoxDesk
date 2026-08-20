"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboardRepository = require('../repositories/dashboardRepository');
function getDashboardStats() {
    return dashboardRepository.getDashboardStats();
}
module.exports = {
    getDashboardStats
};
