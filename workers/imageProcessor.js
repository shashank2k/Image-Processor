const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ProcessingRequest = require('../models/processingRequest');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
async function connectDB() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        });
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
}

// Call the connection function
connectDB();

async function processImages() {
    const request = await ProcessingRequest.findOne({ status: 'pending' });
    if (!request) return;

    request.status = 'processing';
    await request.save();

    const processedData = [];

    for (const item of request.csvData) {
        const inputUrls = item['Input Image Urls'].split(',');
        const outputUrls = [];

        for (const url of inputUrls) {
            const response = await axios({ url: url.trim(), responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            const processedImagesPath = path.join(__dirname, '../processed_images');

            // Ensure the directory exists
            if (!fs.existsSync(processedImagesPath)) {
                fs.mkdirSync(processedImagesPath, { recursive: true });
            }
            const outputFileName = `${uuidv4()}.jpg`;
            const outputPath = path.join(processedImagesPath, outputFileName);
            await sharp(buffer).jpeg({ quality: 50 }).toFile(outputPath);

            outputUrls.push(`server/processed_images/${outputFileName}`);
        }

        processedData.push({
            ...item,
            'Output Image Urls': outputUrls.join(',')
        });
    }

    request.processedData = processedData;
    request.status = 'completed';
    await request.save();

    if (request.webhookUrl) {
        axios.post(request.webhookUrl, { requestId: request.requestId, status: 'completed', processedData });
    }
}

setInterval(processImages, 5000);
