const mongoose = require('mongoose');

const LoggedMealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LoggedMeal', LoggedMealSchema);