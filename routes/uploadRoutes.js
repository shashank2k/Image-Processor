const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ProcessingRequest = require('../Models/processingRequest');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload CSV and return request ID
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const requestId = uuidv4();
            const newRequest = new ProcessingRequest({
                requestId,
                status: 'pending',
                csvData: results,
                webhookUrl: req.body.webhookUrl
            });

            await newRequest.save();
            fs.unlinkSync(req.file.path); // Clean up uploaded file
            res.json({ requestId });
        });
});

router.get('/status/:requestId', async (req, res) => {
    const request = await ProcessingRequest.findOne({ requestId: req.params.requestId });
    if (!request) return res.status(404).json({ error: 'Request ID not found' });

    res.json({ status: request.status, processedData: request.processedData });
});


module.exports = router;
