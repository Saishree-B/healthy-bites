// frontend/js/community.js

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
    const userId = localStorage.getItem('userId');

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

    const communityRecipeList = document.getElementById('community-recipes');
    
    const fetchCommunityRecipes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/recipes/community`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || 'Failed to fetch recipes.');
            }

            const recipes = await res.json();
            communityRecipeList.innerHTML = '';
            
            recipes.forEach((recipe, index) => {
                const isDiabeticSafe = recipe.nutrition.diabetic_safe;
                const diabeticTag = isDiabeticSafe ?
                    `<span class="bg-green-200 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Diabetic Friendly</span>` :
                    `<span class="bg-red-200 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Not Diabetic Friendly</span>`;

                const isLiked = recipe.likes.includes(userId);
                const heartColorClass = isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400';
                const heartFillClass = isLiked ? 'currentColor' : 'none';

                const chartId = `nutritionChart-${index}`;

                const recipeCard = document.createElement('div');
                recipeCard.className = 'bg-white p-6 rounded-lg shadow-lg relative recipe-card';
                recipeCard.innerHTML = `
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${recipe.name}</h3>
                    <div class="mb-2">${diabeticTag}</div>
                    <p class="text-sm text-gray-500 mb-4">
                        Created by: <span class="font-semibold text-gray-700">${recipe.creator ? recipe.creator.name : 'Unknown'}</span>
                    </p>
                    
                    <p class="text-gray-600 mb-4"><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
                    <p class="text-gray-600 mb-4"><strong>Instructions:</strong> ${recipe.instructions}</p>
                    
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <h4 class="text-lg font-bold">Nutritional Information</h4>
                        <ul class="text-gray-600 text-sm mt-2 space-y-1">
                            <li><strong>Calories:</strong> ${recipe.nutrition.calories.toFixed(2)} kcal</li>
                            <li><strong>Carbohydrates:</strong> ${recipe.nutrition.carbohydrates.toFixed(2)} g</li>
                            <li><strong>Protein:</strong> ${recipe.nutrition.protein.toFixed(2)} g</li>
                            <li><strong>Fat:</strong> ${recipe.nutrition.fat.toFixed(2)} g</li>
                            <li><strong>Fiber:</strong> ${recipe.nutrition.fiber.toFixed(2)} g</li>
                            <li><strong>Sugar:</strong> ${recipe.nutrition.sugar.toFixed(2)} g</li>
                        </ul>
                        <div class="mt-4" style="height: 200px;">
                            <canvas id="${chartId}"></canvas>
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <button class="like-btn" data-id="${recipe._id}">
                                <svg class="h-6 w-6 transition-colors duration-200 heart-icon ${heartColorClass}" fill="${heartFillClass}" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            <span class="text-gray-600 text-sm like-count">${recipe.likes.length} Likes</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button class="share-btn text-gray-400 hover:text-teal-600 transition-colors duration-200" data-name="${recipe.name}">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.444A7-7 0 0115.716 11H12V4H4V11H12V4L20 12L12 20V13H11V15" />
                                </svg>
                            </button>
                            <button class="comment-btn text-gray-400 hover:text-teal-600 transition-colors duration-200" data-id="${recipe._id}">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-200 comments-section" style="display: none;" data-id="${recipe._id}">
                        <div class="comments-list space-y-2">
                            ${recipe.comments.map(comment => `
                                <div class="bg-gray-100 p-2 rounded-md">
                                    <p class="text-gray-800 text-sm"><strong>${comment.username}</strong>: ${comment.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mt-4 flex items-center">
                            <input type="text" class="comment-input flex-1 p-2 border rounded-md focus:ring focus:ring-teal-200" placeholder="Write a comment...">
                            <button class="add-comment-btn ml-2 bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition-colors duration-200">Post</button>
                        </div>
                    </div>
                `;
                communityRecipeList.appendChild(recipeCard);
            });

            // ADDED: Loop to render the charts after the HTML is in the DOM
            recipes.forEach((recipe, index) => {
                const { calories, carbohydrates, protein, fat, fiber, sugar } = recipe.nutrition;
                const chartId = `nutritionChart-${index}`;
                if (calories && carbohydrates && protein && fat && fiber && sugar) {
                    createBarChart(chartId, calories, carbohydrates, protein, fat, fiber, sugar);
                }
            });

            addEventListeners();
        
        } catch (error) {
            console.error('Error fetching community recipes:', error);
            communityRecipeList.innerHTML = '<p class="text-center text-gray-500">Could not load community recipes. Please try again later.</p>';
        }
    };

    const handleLike = async (event) => {
        const likeBtn = event.currentTarget.closest('.like-btn');
        if (!likeBtn) return;

        const recipeCard = likeBtn.closest('.recipe-card');
        const recipeId = likeBtn.dataset.id;
        const likeCountSpan = recipeCard.querySelector('.like-count');
        const heartIcon = recipeCard.querySelector('.heart-icon');

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token) {
            alert('You must be logged in to like a recipe.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || 'Failed to like recipe.');
            }

            const updatedLikes = await res.json();
            
            if (likeCountSpan) {
                likeCountSpan.textContent = `${updatedLikes.length} Likes`;
            }

            if (heartIcon) {
                const isLiked = updatedLikes.some(like => like.user.toString() === userId);

                if (isLiked) {
                    heartIcon.classList.add('text-red-500');
                    heartIcon.classList.remove('text-gray-400');
                } else {
                    heartIcon.classList.remove('text-red-500');
                    heartIcon.classList.add('text-gray-400');
                }
            }
        } catch (error) {
            console.error('Error liking recipe:', error);
            alert('An unexpected error occurred. Please check the console for details.');
        }
    };

    const handleShare = async (event) => {
        const shareBtn = event.currentTarget;
        const recipeName = shareBtn.dataset.name;
        const shareLink = `${window.location.origin}/community.html`;
        try {
            await navigator.clipboard.writeText(`Check out this healthy recipe from Healthy Bites: "${recipeName}"! Link: ${shareLink}`);
            alert('Share link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy share link:', err);
            alert('Failed to copy link. Please try again.');
        }
    };
    
    const handleComment = async (event) => {
        const commentBtn = event.currentTarget;
        const recipeCard = commentBtn.closest('.recipe-card');
        const commentsSection = recipeCard.querySelector('.comments-section');
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    };

    const handleAddComment = async (event) => {
        const postBtn = event.currentTarget;
        const recipeCard = postBtn.closest('.recipe-card');
        const recipeId = recipeCard.querySelector('.like-btn').dataset.id;
        const commentInput = recipeCard.querySelector('.comment-input');
        const commentsListDiv = recipeCard.querySelector('.comments-list');
        const commentText = commentInput.value;

        if (commentText.trim() === '') return;

        try {
            const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentText })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || 'Failed to add comment.');
            }

            const updatedComments = await res.json();

            commentsListDiv.innerHTML = updatedComments.map(comment => `
                <div class="bg-gray-100 p-2 rounded-md">
                    <p class="text-gray-800 text-sm"><strong>${comment.username}</strong>: ${comment.text}</p>
                </div>
            `).join('');

            commentInput.value = '';
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    };
    
    const addEventListeners = () => {
        document.querySelectorAll('.like-btn').forEach(button => {
            button.removeEventListener('click', handleLike);
            button.addEventListener('click', handleLike);
        });
        document.querySelectorAll('.share-btn').forEach(button => {
            button.removeEventListener('click', handleShare);
            button.addEventListener('click', handleShare);
        });
        document.querySelectorAll('.comment-btn').forEach(button => {
            button.removeEventListener('click', handleComment);
            button.addEventListener('click', handleComment);
        });
        document.querySelectorAll('.add-comment-btn').forEach(button => {
            button.removeEventListener('click', handleAddComment);
            button.addEventListener('click', handleAddComment);
        });
    };

    fetchCommunityRecipes();
});