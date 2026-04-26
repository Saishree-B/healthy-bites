document.addEventListener('DOMContentLoaded', () => {
    const addRecipeForm = document.getElementById('add-recipe-form');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    addRecipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('recipe-name').value;
        const ingredients = document.getElementById('ingredients').value.split('\n').map(item => item.trim()).filter(item => item);
        const instructions = document.getElementById('instructions').value;

        try {
            const response = await fetch('http://localhost:3000/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, ingredients, instructions })
            });

            if (response.ok) {
                alert('Recipe added successfully! Nutrition facts are being calculated.');
                window.location.href = 'index.html'; // Redirect to dashboard
            } else {
                const errorData = await response.json();
                alert('Failed to add recipe: ' + errorData.msg);
            }
        } catch (error) {
            console.error('Error adding recipe:', error);
            alert('An error occurred. Please try again.');
        }
    });
});