const mongoose = require('mongoose');

const ProcessingRequestSchema = new mongoose.Schema({
    requestId: { type: String, unique: true, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
    csvData: { type: Array, required: true },
    processedData: { type: Array, default: [] },
    webhookUrl: { type: String }
});

module.exports = mongoose.model('ProcessingRequest', ProcessingRequestSchema);
