const User = require('../models/User');
const LoggedMeal = require('../models/LoggedMeal');
const { calculateGoals } = require('../utils/goalCalculator');

exports.updateProfile = async (req, res) => {
    const { name, height, weight, age } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.name = name || user.name;
        user.height = height || user.height;
        user.weight = weight || user.weight;
        user.age = age || user.age;
        
        if (height && weight && age) {
            const { dailyCalorieGoal, dailyCarbGoal } = calculateGoals(weight, height, age);
            user.dailyCalorieGoal = dailyCalorieGoal;
            user.dailyCarbGoal = dailyCarbGoal;
        }

        await user.save();
        res.json({ msg: 'Profile updated successfully', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.logMeal = async (req, res) => {
    try {
        const { recipeId } = req.body;
        const newLog = new LoggedMeal({
            user: req.user.id,
            recipe: recipeId,
            date: new Date()
        });
        await newLog.save();
        res.status(201).json({ msg: 'Meal logged successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getDailySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const dailyLogs = await LoggedMeal.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('recipe');

        // CORRECTED: Initialize the summary object with all nutritional values
        let summary = {
            calories: 0,
            carbohydrates: 0,
            protein: 0,
            fat: 0,
            fiber: 0,   // ADDED
            sugar: 0    // ADDED
        };

        dailyLogs.forEach(log => {
            if (log.recipe && log.recipe.nutrition) {
                summary.calories += log.recipe.nutrition.calories || 0;
                summary.carbohydrates += log.recipe.nutrition.carbohydrates || 0;
                summary.protein += log.recipe.nutrition.protein || 0;
                summary.fat += log.recipe.nutrition.fat || 0;
                // CORRECTED: Add the missing fields to the sum
                summary.fiber += log.recipe.nutrition.fiber || 0;
                summary.sugar += log.recipe.nutrition.sugar || 0;
            }
        });

        res.json({ dailyLogs, summary });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};