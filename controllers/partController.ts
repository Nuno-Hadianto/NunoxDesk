import { Part } from '../src/types';
const partRepository = require('../repositories/partRepository');
const { SparepartSchema, validateData } = require('../src/utils/validators');

function getParts(searchQuery = '') {
    return partRepository.getParts(searchQuery);
}

function getPartById(id: number | string) {
    return partRepository.getPartById(id);
}

function addPart(data: Part) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.addPart(validData);
}

function updatePart(id: number | string, data: Part) {
    const validData = validateData(SparepartSchema, data);
    return partRepository.updatePart(id, validData);
}

function updatePartStock(id, change) {
    return partRepository.updatePartStock(id, change);
}

function deletePart(id: number | string) {
    const hasServiceItems = partRepository.checkPartHasServiceItems(id);
    if (hasServiceItems) {
        throw new Error("Sparepart tidak bisa dihapus karena sudah tercatat dalam riwayat rincian biaya servis.");
    }
    return partRepository.deletePart(id);
}

function importParts(dataArray) {
    return partRepository.importParts(dataArray);
}

module.exports = {
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    deletePart,
    importParts
};
