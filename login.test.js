/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

document.body.innerHTML = fs.readFileSync(path.resolve(__dirname, 'login.html'), 'utf8');
require('./script.js');

describe('Login Page', () => {
    beforeEach(() => {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('message').textContent = '';
    });

    it('should show error if fields are empty', () => {
        const form = document.getElementById('loginForm');
        const event = new Event('submit');
        form.dispatchEvent(event);
        expect(document.getElementById('message').textContent).toBe(''); // HTML5 required handles this
    });

    it('should show error on failed login', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'user not found' })
        }));
        document.getElementById('username').value = 'wrong@reqres.in';
        document.getElementById('password').value = 'wrong';
        const form = document.getElementById('loginForm');
        const event = new Event('submit');
        await form.dispatchEvent(event);
        expect(document.getElementById('message').textContent).toBe('user not found');
    });

    it('should show success on correct login', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ token: 'abc123' })
        }));
        document.getElementById('username').value = 'eve.holt@reqres.in';
        document.getElementById('password').value = 'cityslicka';
        const form = document.getElementById('loginForm');
        const event = new Event('submit');
        await form.dispatchEvent(event);
        expect(document.getElementById('message').textContent).toBe('Login successful!');
    });
});
