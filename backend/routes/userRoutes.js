const express = require('express');
const router = express.Router();
// Corrected path to the middleware folder
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// @route   PUT api/users/profile
// @desc    Update user profile and calculate goals
// @access  Private
router.put('/profile', authMiddleware, userController.updateProfile);

// @route   GET api/users/profile
// @desc    Get user profile data
// @access  Private
router.get('/profile', authMiddleware, userController.getUserProfile);

// @route   POST api/users/log-meal
// @desc    Log a meal for a user
// @access  Private
router.post('/log-meal', authMiddleware, userController.logMeal);

// @route   GET api/users/daily-summary
// @desc    Get a user's daily meal summary
// @access  Private
router.get('/daily-summary', authMiddleware, userController.getDailySummary);

module.exports = router;