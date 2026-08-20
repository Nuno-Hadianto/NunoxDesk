"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const partRepository = require('../repositories/partRepository');
const { SparepartSchema, validateData } = require('../src/utils/validators');
function getParts(searchQuery = '') {
    return partRepository.getParts(searchQuery);
}
function getPartById(id) {
    return partRepository.getPartById(id);
}
function addPart(data) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.addPart(validData);
}
function updatePart(id, data) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.updatePart(id, validData);
}
function updatePartStock(id, change) {
    return partRepository.updatePartStock(id, change);
}
function deletePart(id) {
    const hasServiceItems = partRepository.checkPartHasServiceItems(id);
    if (hasServiceItems) {
        throw new Error("Sparepart tidak bisa dihapus karena sudah tercatat dalam riwayat rincian biaya servis.");
    }
    return partRepository.deletePart(id);
}
function importParts(dataArray) {
    return partRepository.importParts(dataArray);
}
function getLowStockParts(threshold) {
    return partRepository.getLowStockParts(threshold);
}
module.exports = {
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    deletePart,
    importParts,
    getLowStockParts
};
