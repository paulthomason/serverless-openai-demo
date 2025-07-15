// Get references to the HTML elements
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const submitButton = document.getElementById('submit-button');
const buttonText = document.getElementById('button-text');
const spinner = document.getElementById('spinner');
const responseContainer = document.getElementById('response-container');
const responseText = document.getElementById('response-text');
const errorBox = document.getElementById('error-box');
const errorText = document.getElementById('error-text');
const logContainer = document.getElementById('log-container');
const logText = document.getElementById('log-text');

// The URL for your Netlify serverless function.
// IMPORTANT: This will be the URL of your Netlify site.
const functionUrl = 'https://unique-gingersnap-b64334.netlify.app/.netlify/functions/openai-proxy';

// Listen for form submission
promptForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page

    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        showError("Please enter a prompt.");
        return;
    }

    // --- Show Loading State ---
    setLoading(true);
    hideError();
    responseContainer.classList.add('hidden');


    try {
        // Make a POST request to the serverless function
        appendLog('Sending prompt: ' + userPrompt);
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userPrompt }),
        });

        appendLog('Received status: ' + response.status);

        if (!response.ok) {
            // Handle HTTP errors like 404 or 500
            const errorText = await response.text();
            appendLog('Error response body: ' + errorText);
            let parsed;
            try { parsed = JSON.parse(errorText); } catch {}
            throw new Error((parsed && parsed.error) || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        appendLog('Success response: ' + JSON.stringify(data));
        
        // Display the response
        responseText.textContent = data.reply;
        responseContainer.classList.remove('hidden');

    } catch (error) {
        // Show any errors to the user
        console.error('Error fetching AI response:', error);
        appendLog('Error: ' + error.message);
        showError(error.message);
    } finally {
        // --- Hide Loading State ---
        setLoading(false);
    }
});

// --- UI Helper Functions ---

function setLoading(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        buttonText.textContent = 'Thinking...';
        spinner.classList.remove('hidden');
    } else {
        submitButton.disabled = false;
        buttonText.textContent = 'Get Response';
        spinner.classList.add('hidden');
    }
}

function showError(message) {
    errorText.textContent = message;
    errorBox.classList.remove('hidden');
}

function hideError() {
    errorBox.classList.add('hidden');
}

function appendLog(message) {
    if (logText) {
        logText.textContent += message + '\n';
        logContainer.classList.remove('hidden');
    }
}
