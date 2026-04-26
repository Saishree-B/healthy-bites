const Recipe = require('../models/Recipe');
const User = require('../models/User');
const axios = require('axios');
const config = require('config');

const ML_SERVICE_URL = config.get('ML_SERVICE_URL');

exports.createRecipe = async (req, res) => {
    try {
        const { name, ingredients, instructions } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }

        const newRecipe = new Recipe({
            name,
            ingredients,
            instructions,
            creator: req.user.id
        });

        await newRecipe.save();

        try {
            if (!ML_SERVICE_URL) {
                console.warn('ML_SERVICE_URL is not configured. Nutrition data will be 0.');
            } else {
                const mlResponse = await axios.post(ML_SERVICE_URL, {
                    ingredients: newRecipe.ingredients.join(', ')
                });

                const mlData = mlResponse.data;

                newRecipe.nutrition = {
                    calories: mlData.calories,
                    carbohydrates: mlData.carbohydrates,
                    protein: mlData.protein,
                    fat: mlData.fat,
                    fiber: mlData.fiber,
                    sugar: mlData.sugar,
                    diabetic_safe: mlData.diabetic_safe
                };

                await newRecipe.save();
            }
        } catch (mlError) {
            console.error('ML service error:', mlError.message);
        }

        res.status(201).json(newRecipe);
    } catch (err) {
        console.error('Server Error creating recipe:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getMyRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ creator: req.user.id }).sort({ date: -1 });
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getCommunityRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .sort({ likes: -1 })
            .populate('creator', 'name');
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.searchRecipes = async (req, res) => {
    try {
        const query = req.query.q;
        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { ingredients: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.likeRecipe = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        const hasLiked = recipe.likes.map(id => id.toString()).includes(userId);
        let updatedRecipe;

        if (hasLiked) {
            updatedRecipe = await Recipe.findByIdAndUpdate(
                req.params.id,
                { $pull: { likes: { user: userId } } },
                { new: true }
            );
        } else {
            updatedRecipe = await Recipe.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { likes: { user: userId } } },
                { new: true }
            );
        }

        if (!updatedRecipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        res.json(updatedRecipe.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ msg: 'Comment text is required' });
        }

        const newComment = {
            user: user._id, // CORRECTED: This line now uses the correct ObjectId
            username: user.name,
            text
        };

        recipe.comments.push(newComment);
        await recipe.save();

        res.json(recipe.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateRecipe = async (req, res) => {
    try {
        const { name, ingredients, instructions } = req.body;
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        if (recipe.creator.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            { $set: { name, ingredients, instructions } },
            { new: true, runValidators: true }
        );

        res.json(updatedRecipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        if (recipe.creator.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        await recipe.deleteOne();
        res.json({ msg: 'Recipe removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};