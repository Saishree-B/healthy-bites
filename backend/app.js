const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('config');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.get('mongoURI'))
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// FIRST: Explicitly require all Mongoose models to register their schemas
require('./models/User');
require('./models/Recipe');
require('./models/LoggedMeal');

// THEN: Require and use the routes that depend on those models
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');

// Serve static frontend files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

module.exports = app;