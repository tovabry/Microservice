const AUTH_SERVER_URL = 'http://localhost:9000';
const RESOURCE_SERVER_URL = 'http://localhost:8080'; // Your resource server
const CLIENT_ID = 'spa-client-id'; // Must match the client ID in Spring Boot
const REDIRECT_URI = 'http://localhost:7000/callback.html'; // SPA's callback
const SCOPES = 'openid read_resource'; // Request 'openid' for ID token, 'read_resource' for your API

// Helper function to generate a random string for code_verifier and state
function generateRandomString(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Helper function to generate PKCE code challenge
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

// --- DOM Elements (for index.html) ---
const loginButton = document.getElementById('loginButton');
const callApiButton = document.getElementById('callApiButton');
const logoutButton = document.getElementById('logoutButton');
const statusEl = document.getElementById('status');
const accessTokenEl = document.getElementById('accessToken');
const apiResponseEl = document.getElementById('apiResponse');

// --- Main Logic ---

if (loginButton) { // Only run this part on index.html
    loginButton.addEventListener('click', redirectToLogin);
}
if (callApiButton) {
    callApiButton.addEventListener('click', callApi);
}
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

// Check login status on page load (for index.html)
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        updateUI();
    }
});


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
        // Clear sensitive items just in case
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('pkce_code_verifier');
        return;
    }

    // Clean up stored items
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

        // Redirect back to the main page (index.html)
        window.location.href = '/index.html'; // Or just '/' if your server serves index.html at root

    } catch (error) {
        console.error('Error exchanging code for token:', error);
        if (document.body) { // callback.html context
            document.body.innerHTML = `<p>Error during login: ${error.message}. <a href="/index.html">Go back</a></p>`;
        } else if (statusEl) { // index.html context (though less likely to hit here for token exchange error)
            statusEl.textContent = `Error during login: ${error.message}`;
        }
    }
}

async function callApi() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        statusEl.textContent = 'Not logged in. Please login first.';
        apiResponseEl.textContent = 'N/A';
        return;
    }

    try {
        const response = await fetch(`${RESOURCE_SERVER_URL}/secure`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 401) { // Unauthorized, token might be expired
            statusEl.textContent = 'Access token might be expired or invalid. Try logging in again.';
            apiResponseEl.textContent = 'Unauthorized (401)';
            // Potentially implement refresh token logic here if you have it
            return;
        }

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.text(); // Or response.json() if it returns JSON
        apiResponseEl.textContent = data;
        statusEl.textContent = 'API call successful.';

    } catch (error) {
        console.error('Error calling API:', error);
        apiResponseEl.textContent = `Error: ${error.message}`;
        statusEl.textContent = 'API call failed.';
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    updateUI();
    // Optional: Call token revocation endpoint if your AS supports it and you want to invalidate server-side session/token
    // Example:
    // const token = localStorage.getItem('access_token'); // or refresh_token
    // if (token) {
    //   fetch(`${AUTH_SERVER_URL}/oauth2/revoke`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //     body: new URLSearchParams({
    //       token: token,
    //       client_id: CLIENT_ID,
    //       // client_secret: 'your_secret' // if your client auth method for revocation needs it
    //     })
    //   }).then(() => console.log('Token revoked')).catch(err => console.error('Revocation error', err));
    // }
}


function updateUI() {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        statusEl.textContent = 'Logged in.';
        accessTokenEl.textContent = accessToken;
        loginButton.style.display = 'none';
        callApiButton.style.display = 'inline-block';
        logoutButton.style.display = 'inline-block';

        // Optionally decode and display ID token claims
        const idToken = localStorage.getItem('id_token');
        if (idToken) {
            try {
                const payload = JSON.parse(atob(idToken.split('.')[1])); // Decode base64url
                console.log("ID Token Payload:", payload);
                statusEl.innerHTML += `<br>User (from ID Token sub): ${payload.sub}`;
            } catch (e) {
                console.error("Error decoding ID token", e);
            }
        }

    } else {
        statusEl.textContent = 'Not logged in.';
        accessTokenEl.textContent = 'N/A';
        apiResponseEl.textContent = 'N/A';
        loginButton.style.display = 'inline-block';
        callApiButton.style.display = 'none';
        logoutButton.style.display = 'none';
    }
}

// Make handleCallback globally accessible for callback.html
window.handleCallback = handleCallback;