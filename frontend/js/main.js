// frontend/js/main.js

const API_BASE_URL = 'http://localhost:3000/api';

// New function to create a bar chart for all nutrients
const createBarChart = (canvasId, calories, carbs, protein, fat, fiber, sugar) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chartData = {
        labels: ['Calories (kcal)', 'Carbohydrates (g)', 'Protein (g)', 'Fat (g)', 'Fiber (g)', 'Sugar (g)'],
        datasets: [{
            label: 'Predicted Nutrition',
            data: [calories, carbs, protein, fat, fiber, sugar],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Nutrition Chart'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

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

    const recipeList = document.getElementById('recipe-list');
    if (recipeList) {
        try {
            // Fetch user's profile and goals
            const userRes = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = await userRes.json();
            
            if (userRes.ok && userData) {
                document.getElementById('dailyCalories').textContent = `${Math.round(userData.dailyCalorieGoal || 0)} kcal`;
                document.getElementById('dailyCarbGoal').textContent = `${Math.round(userData.dailyCarbGoal || 0)} g`;
            }

            // Fetch user's recipes
            const res = await fetch(`${API_BASE_URL}/recipes/my-recipes`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const recipes = await res.json();
            recipeList.innerHTML = '';

            if (recipes.length === 0) {
                recipeList.innerHTML = '<p class="text-center text-gray-500">You have not added any recipes yet. Be the first!</p>';
                return;
            }

            recipes.forEach((recipe, index) => {
                // Corrected: Access nutrition values from the nested 'nutrition' object
                const { name, ingredients, instructions } = recipe;
                const { calories, carbohydrates, protein, fat, fiber, sugar, diabetic_safe } = recipe.nutrition;

                const diabeticTag = diabetic_safe ?
                    `<span class="bg-green-200 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Diabetic Friendly</span>` :
                    `<span class="bg-red-200 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Not Diabetic Friendly</span>`;

                const chartId = `nutritionChart-${index}`;

                // Corrected: Use the correctly accessed nutrition variables in the template
                recipeList.innerHTML += `
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${name}</h3>
                        <div class="mb-2">${diabeticTag}</div>
                        <p class="text-gray-600 mb-4"><strong>Ingredients:</strong> ${ingredients.join(', ')}</p>
                        <p class="text-gray-600 mb-4"><strong>Instructions:</strong> ${instructions}</p>
                        <div class="bg-gray-50 p-4 rounded-md">
                            <h4 class="font-semibold text-gray-700 mb-2">Nutrition Facts (per serving)</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li><strong>Calories:</strong> ${calories ? calories.toFixed(2) : 'N/A'} kcal</li>
                                <li><strong>Carbohydrates:</strong> ${carbohydrates ? carbohydrates.toFixed(2) : 'N/A'} g</li>
                                <li><strong>Protein:</strong> ${protein ? protein.toFixed(2) : 'N/A'} g</li>
                                <li><strong>Fat:</strong> ${fat ? fat.toFixed(2) : 'N/A'} g</li>
                                <li><strong>Fiber:</strong> ${fiber ? fiber.toFixed(2) : 'N/A'} g</li>
                                <li><strong>Sugar:</strong> ${sugar ? sugar.toFixed(2) : 'N/A'} g</li>
                            </ul>
                            <div class="mt-4" style="height: 200px;">
                                <canvas id="${chartId}"></canvas>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // Corrected: Use the same approach to call the chart function after the HTML is rendered
            recipes.forEach((recipe, index) => {
                const { calories, carbohydrates, protein, fat, fiber, sugar } = recipe.nutrition;
                const chartId = `nutritionChart-${index}`;
                if (calories && carbohydrates && protein && fat && fiber && sugar) {
                    createBarChart(chartId, calories, carbohydrates, protein, fat, fiber, sugar);
                }
            });

        } catch (error) {
            console.error(error);
            alert('Error loading data: ' + error.message);
        }
    }
});