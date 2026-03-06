require('dotenv').config();
const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // allows us to parse json

// Routes
app.use('/api/transactions', transactionRoutes);

// Database connection test (optional, can just start server)
const db = require('./db');

app.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'ok', db_time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
