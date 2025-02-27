require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const uploadRoutes = require('./routes/uploadRoutes');
const webhookRoutes = require('./routes/webHooksRoutes');

const app = express();
app.use(express.json());

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Reduce timeout to fail faster
        });
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
}

connectDB();

app.use('/api', uploadRoutes);
app.use('/processed_images', express.static('processed_images'));
app.use('/api', webhookRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
