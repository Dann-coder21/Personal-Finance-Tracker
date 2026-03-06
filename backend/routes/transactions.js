const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getTransactions);

// Get summary (income, expense, balance)
router.get('/summary', transactionController.getSummary);

// Get a single transaction
router.get('/:id', transactionController.getTransactionById);

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Update a transaction
router.put('/:id', transactionController.updateTransaction);

// Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

// Categories routes
router.get('/categories/all', transactionController.getCategories);

module.exports = router;
