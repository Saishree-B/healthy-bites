// frontend/js/profile.js

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

    const profileForm = document.getElementById('profileForm');
    const profileMessage = document.getElementById('profileMessage');

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const user = await res.json();
            if (res.ok) {
                profileForm.name.value = user.name || '';
                profileForm.height.value = user.height || '';
                profileForm.weight.value = user.weight || '';
                profileForm.age.value = user.age || '';
                profileMessage.textContent = 'Profile loaded successfully!';
                profileMessage.className = 'text-green-500 text-center';
            } else {
                profileMessage.textContent = user.msg || 'Failed to load profile.';
                profileMessage.className = 'text-red-500 text-center';
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            profileMessage.textContent = 'An error occurred while fetching your profile.';
            profileMessage.className = 'text-red-500 text-center';
        }
    };

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const height = e.target.height.value;
            const weight = e.target.weight.value;
            const age = e.target.age.value;
            const name = e.target.name.value;

            try {
                const res = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, height, weight, age })
                });
                const data = await res.json();
                
                if (res.ok) {
                    profileMessage.textContent = 'Profile updated successfully!';
                    profileMessage.className = 'text-green-500 text-center';
                } else {
                    profileMessage.textContent = data.msg || 'Failed to update profile.';
                    profileMessage.className = 'text-red-500 text-center';
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                profileMessage.textContent = 'An error occurred while updating your profile.';
                profileMessage.className = 'text-red-500 text-center';
            }
        });

        fetchUserProfile();
    }
});