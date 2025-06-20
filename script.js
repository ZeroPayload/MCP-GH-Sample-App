// Simple login using a free mock API (https://reqres.in/)
async function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';

    try {
        const response = await fetch('https://reqres.in/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: username, password: password })
        });
        const data = await response.json();
        if (response.ok) {
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Login successful!';
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = data.error || 'Login failed!';
        }
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error!';
    }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);
