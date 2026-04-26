const express = require('express');
const router = express.Router();
// Corrected path to the middleware folder
const authMiddleware = require('../middleware/authMiddleware');
const recipeController = require('../controllers/recipeController');

// @route   POST api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', authMiddleware, recipeController.createRecipe);

// @route   GET api/recipes/my-recipes
// @desc    Get all recipes for the logged-in user
// @access  Private
router.get('/my-recipes', authMiddleware, recipeController.getMyRecipes);

// @route   GET api/recipes/community
// @desc    Get all recipes from the community
// @access  Private
router.get('/community', authMiddleware, recipeController.getCommunityRecipes);

// @route   GET api/recipes/search?q=query
// @desc    Search all recipes for a given query
// @access  Private
router.get('/search', authMiddleware, recipeController.searchRecipes);

// @route   POST api/recipes/:id/like
// @desc    Like or unlike a recipe
// @access  Private
router.post('/:id/like', authMiddleware, recipeController.likeRecipe);

// @route   POST api/recipes/:id/comment
// @desc    Add a comment to a recipe
// @access  Private
router.post('/:id/comment', authMiddleware, recipeController.addComment);

module.exports = router;