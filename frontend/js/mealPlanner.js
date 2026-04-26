// frontend/js/mealPlanner.js

const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        });
    }

    const recipeSelect = document.getElementById('recipeSelect');
    const addMealForm = document.getElementById('addMealForm');
    const mealList = document.getElementById('mealList');
    const dailySummaryDiv = document.getElementById('dailySummary');

    const fetchRecipes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/recipes/my-recipes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const recipes = await res.json();
            if (res.ok) {
                recipeSelect.innerHTML = '<option value="">Select a recipe</option>';
                recipes.forEach(recipe => {
                    const option = document.createElement('option');
                    option.value = recipe._id;
                    option.textContent = recipe.name;
                    recipeSelect.appendChild(option);
                });
            } else {
                console.error('Failed to fetch recipes:', recipes.msg);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    const fetchMeals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/daily-summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const summary = await res.json();
            if (res.ok) {
                // Display the list of meals
                mealList.innerHTML = '';
                summary.dailyLogs.forEach(meal => {
                    const mealDiv = document.createElement('div');
                    mealDiv.className = 'bg-gray-100 p-4 rounded-md shadow-sm';
                    mealDiv.innerHTML = `<h3 class="text-lg font-semibold text-gray-800">${meal.recipe.name}</h3>`;
                    mealList.appendChild(mealDiv);
                });

                // Display the daily summary with all nutrients, with checks for undefined values
                if (dailySummaryDiv && summary.summary) {
                    const { calories, carbohydrates, protein, fat, fiber, sugar } = summary.summary;
                    dailySummaryDiv.innerHTML = `
                        <h3 class="text-lg font-semibold mb-2">Daily Nutrition Summary</h3>
                        <p><strong>Calories:</strong> ${(calories || 0).toFixed(2)} kcal</p>
                        <p><strong>Carbohydrates:</strong> ${(carbohydrates || 0).toFixed(2)} g</p>
                        <p><strong>Protein:</strong> ${(protein || 0).toFixed(2)} g</p>
                        <p><strong>Fat:</strong> ${(fat || 0).toFixed(2)} g</p>
                        <p><strong>Fiber:</strong> ${(fiber || 0).toFixed(2)} g</p>
                        <p><strong>Sugar:</strong> ${(sugar || 0).toFixed(2)} g</p>
                    `;
                }

            } else {
                console.error('Failed to fetch daily summary:', summary.msg);
            }
        } catch (error) {
            console.error('Error fetching daily summary:', error);
        }
    };

    if (addMealForm) {
        addMealForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const recipeId = recipeSelect.value;
            if (!recipeId) {
                alert('Please select a recipe.');
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/users/log-meal`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ recipeId })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Meal added successfully!');
                    fetchMeals(); // Refresh the meal list and summary
                } else {
                    alert(data.msg || 'Failed to add meal.');
                }
            } catch (error) {
                console.error('Error adding meal:', error);
                alert('An error occurred while adding the meal.');
            }
        });
    }

    // Call the functions to load data when the page loads
    fetchRecipes();
    fetchMeals();
});