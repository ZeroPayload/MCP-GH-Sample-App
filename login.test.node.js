const fs = require('fs');
const { JSDOM } = require('jsdom');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupDom() {
    const html = fs.readFileSync('login.html', 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    const { window } = dom;
    const scriptContent = fs.readFileSync('script.js', 'utf8');
    window.eval(scriptContent);
    return window;
}

async function runTests() {
    let passed = 0, failed = 0;
    function assertEqual(actual, expected, msg) {
        if (actual === expected) {
            console.log('?', msg);
            passed++;
        } else {
            console.error('?', msg, `(Expected: ${expected}, Got: ${actual})`);
            failed++;
        }
    }

    // Test 1: Empty fields (HTML5 required prevents submit, so nothing happens)
    const win1 = setupDom();
    win1.document.getElementById('username').value = '';
    win1.document.getElementById('password').value = '';
    if (typeof win1.handleLogin === 'function') {
        await win1.handleLogin({ preventDefault: () => {} });
    }
    assertEqual(win1.document.getElementById('message').textContent, 'Network error!', 'Empty fields should show network error');

    // Test 2: Failed login
    const win2 = setupDom();
    win2.fetch = async () => ({
        ok: false,
        json: async () => ({ error: 'user not found' })
    });
    win2.document.getElementById('username').value = 'wrong@reqres.in';
    win2.document.getElementById('password').value = 'wrong';
    if (typeof win2.handleLogin === 'function') {
        await win2.handleLogin({ preventDefault: () => {} });
    }
    assertEqual(win2.document.getElementById('message').textContent, 'user not found', 'Failed login should show error');

    // Test 3: Successful login
    const win3 = setupDom();
    win3.fetch = async () => ({
        ok: true,
        json: async () => ({ token: 'abc123' })
    });
    win3.document.getElementById('username').value = 'eve.holt@reqres.in';
    win3.document.getElementById('password').value = 'cityslicka';
    if (typeof win3.handleLogin === 'function') {
        await win3.handleLogin({ preventDefault: () => {} });
    }
    assertEqual(win3.document.getElementById('message').textContent, 'Login successful!', 'Successful login should show success');

    console.log(`\n${passed} passed, ${failed} failed.`);
    process.exit(failed ? 1 : 0);
}

runTests();
