import { Part } from '../src/types';
const partRepository = require('../repositories/partRepository');

function getParts(searchQuery = '') {
    return partRepository.getParts(searchQuery);
}

function getPartById(id: number | string) {
    return partRepository.getPartById(id);
}

function addPart(data: Part) {
    return partRepository.addPart(data);
}

function updatePart(id: number | string, data: Part) {
    return partRepository.updatePart(id, data);
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
