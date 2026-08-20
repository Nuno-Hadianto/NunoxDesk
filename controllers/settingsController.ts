const settingsRepository = require('../repositories/settingsRepository');

function getSettings() {
    return settingsRepository.getSettings();
}

function updateSettings(data) {
    return settingsRepository.updateSettings(data);
}

module.exports = {
    getSettings,
    updateSettings
};
