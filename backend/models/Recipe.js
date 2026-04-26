// backend/models/Recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Corrected: capital 'U'
    },
    name: {
        type: String,
        required: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    nutrition: {
        calories: { type: Number, default: 0 },
        carbohydrates: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },
        diabetic_safe: { type: Boolean, default: false }
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User' // Corrected: capital 'U'
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User' // Corrected: capital 'U'
            },
            username: {
                type: String
            },
            text: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Recipe = mongoose.model('Recipe', RecipeSchema);