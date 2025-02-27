const express = require('express');
const router = express.Router();

router.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.json({ message: 'Webhook received successfully' });
});

module.exports = router;
