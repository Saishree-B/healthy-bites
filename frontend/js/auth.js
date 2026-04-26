// frontend/js/auth.js

const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;

            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId); // Store the user ID
                    window.location.href = 'index.html';
                } else {
                    alert(data.msg || 'Login failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = e.target.name.value;
            const email = e.target.email.value;
            const password = e.target.password.value;

            try {
                const res = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Registration successful! You can now log in.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.msg || 'Registration failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during registration.');
            }
        });
    }
});