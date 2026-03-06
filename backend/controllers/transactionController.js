const db = require('../db');

exports.getTransactions = async (req, res) => {
    try {
        const result = await db.query('SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ORDER BY t.date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const income = await db.query("SELECT SUM(amount) FROM transactions WHERE type = 'income'");
        const expense = await db.query("SELECT SUM(amount) FROM transactions WHERE type = 'expense'");

        const totalIncome = parseFloat(income.rows[0].sum || 0);
        const totalExpense = parseFloat(expense.rows[0].sum || 0);
        const balance = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            balance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Transaction not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const { amount, date, description, category_id, type } = req.body;
        const result = await db.query(
            'INSERT INTO transactions (amount, date, description, category_id, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [amount, date, description, category_id, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, date, description, category_id, type } = req.body;
        const result = await db.query(
            'UPDATE transactions SET amount = $1, date = $2, description = $3, category_id = $4, type = $5 WHERE id = $6 RETURNING *',
            [amount, date, description, category_id, type, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Transaction not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
