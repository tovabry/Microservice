const AUTH_SERVER_URL = 'http://localhost:9000';
const CLIENT_ID = 'spa-client-id';
const REDIRECT_URI = 'http://localhost:7000/callback.html';
const GATEWAY_URL = 'http://localhost:8080';

const SCOPES = 'openid read_resource';

function generateRandomString(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
}

function base64UrlEncode(arrayBuffer) {
    let base64 = window.btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const statusEl = document.getElementById('status');
const accessTokenEl = document.getElementById('accessToken');
const apiResponseEl = document.getElementById('apiResponse');

if (loginButton) {
    loginButton.addEventListener('click', redirectToLogin);
}
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', updateUI); //always run updateUI on page load

async function redirectToLogin() {
    const codeVerifier = generateRandomString(64);
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const state = generateRandomString(32);
    sessionStorage.setItem('oauth_state', state);

    const authUrl = new URL(`${AUTH_SERVER_URL}/oauth2/authorize`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
}

async function handleCallback() {
    console.log("Handling callback...");
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const receivedState = params.get('state');

    const storedState = sessionStorage.getItem('oauth_state');
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

    if (!code) {
        statusEl.textContent = 'Error: No authorization code received.';
        console.error('No authorization code.');
        return;
    }

    if (receivedState !== storedState) {
        statusEl.textContent = 'Error: State mismatch. Possible CSRF attack.';
        console.error('State mismatch.');
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('pkce_code_verifier');
        return;
    }

    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('pkce_code_verifier');

    try {
        const tokenResponse = await fetch(`${AUTH_SERVER_URL}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                code_verifier: codeVerifier
            })
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorData.error_description || errorData.error || 'Unknown error'}`);
        }

        const tokenData = await tokenResponse.json();
        localStorage.setItem('access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
            localStorage.setItem('refresh_token', tokenData.refresh_token);
        }
        if (tokenData.id_token) {
            localStorage.setItem('id_token', tokenData.id_token);
        }

        window.location.href = '/index.html';

    } catch (error) {
        console.error('Error exchanging code for token:', error);
        if (document.body) {
            document.body.innerHTML = `<p>Error during login: ${error.message}. <a href="/index.html">Go back</a></p>`;
        } else if (statusEl) {
            statusEl.textContent = `Error during login: ${error.message}`;
        }
    }
}

function getAccessToken() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('No access token found');
        return null;
    }
    return token;
}

async function getQuote() {
    try {
        const response = await fetch('http://localhost:8080/api/quotes/random', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAccessToken()
            }
        });
        if (!response.ok) throw new Error('Quote request failed');
        const quote = await response.text();
        apiResponseEl.textContent = quote;
    } catch (error) {
        apiResponseEl.textContent = 'Error: ' + error.message;
    }
}

async function getJoke() {
    try {
        const response = await fetch(`http://localhost:8080/api/jokes/random`, {
            headers: {
                'Authorization': 'Bearer ' + getAccessToken()
            }
        });
        if (!response.ok) throw new Error('Joke request failed');
        const joke = await response.text();
        apiResponseEl.textContent = joke;
    } catch (error) {
        apiResponseEl.textContent = 'Error: ' + error.message;
    }
}

document.getElementById('callQuote').addEventListener('click', getQuote);
document.getElementById('callJoke').addEventListener('click', getJoke);

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    updateUI();
}

function updateUI() {
    console.log("Running updateUI");
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        loginButton.style.display = 'none';
        document.getElementById('callQuote').style.display = 'inline-block';
        document.getElementById('callJoke').style.display = 'inline-block';
        logoutButton.style.display = 'inline-block';
        statusEl.textContent = 'Logged in.';
        accessTokenEl.textContent = accessToken;

        const idToken = localStorage.getItem('id_token');
        if (idToken) {
            try {
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                console.log("ID Token Payload:", payload);
                statusEl.innerHTML += `<br>User (from ID Token sub): ${payload.sub}`;
            } catch (e) {
                console.error("Error decoding ID token", e);
            }
        }
    } else {
        loginButton.style.display = 'inline-block';
        document.getElementById('callQuote').style.display = 'none';
        document.getElementById('callJoke').style.display = 'none';
        logoutButton.style.display = 'none';
        statusEl.textContent = 'Not logged in.';
        accessTokenEl.textContent = 'N/A';
        apiResponseEl.textContent = 'N/A';
    }
}

window.handleCallback = handleCallback;