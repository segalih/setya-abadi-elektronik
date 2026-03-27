const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(bodyParser.json());

// Mock Notification Endpoints
app.post('/notify/email', (req, res) => {
    const { to, subject, body } = req.body;
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`[EMAIL-BODY]: ${body}`);
    
    // Simulating delay
    setTimeout(() => {
        res.json({ success: true, message: 'Email notification sent (mock)' });
    }, 500);
});

app.post('/notify/whatsapp', (req, res) => {
    const { phone, message } = req.body;
    console.log(`[WHATSAPP] To: ${phone}, Msg: ${message}`);
    
    setTimeout(() => {
        res.json({ success: true, message: 'WhatsApp notification sent (mock)' });
    }, 500);
});

// Broadcast Order Update
app.post('/notify/order-update', (req, res) => {
    const { order_id, status, customer_name, customer_email } = req.body;
    
    console.log(`[NOTIFY] Order #${order_id} status changed to ${status}`);
    
    // Logic for sending both
    const msg = `Halo ${customer_name}, pesanan Anda #${order_id} sekarang berstatus: ${status}. Silakan cek dashboard untuk detailnya.`;
    
    console.log(`[MOCK-SENDING-ALL] -> Email to ${customer_email} & WA to client`);
    
    res.json({ 
        success: true, 
        delivered: ['email', 'whatsapp'],
        content: msg 
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'Notification Service is Up' });
});

app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});
