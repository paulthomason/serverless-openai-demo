// Get references to the HTML elements
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const submitButton = document.getElementById('submit-button');
const buttonText = document.getElementById('button-text');
const spinner = document.getElementById('spinner');
const responseContainer = document.getElementById('response-container');
const chatLog = document.getElementById('chat-log');
const errorBox = document.getElementById('error-box');
const errorText = document.getElementById('error-text');

// Maintain conversation history
let messageHistory = [];

function renderChatLog() {
    chatLog.innerHTML = '';
    for (const msg of messageHistory) {
        if (msg.role !== 'system') {
            const p = document.createElement('p');
            p.textContent = msg.content;
            p.className = msg.role === 'user' ? 'text-blue-700 font-medium' : 'text-gray-700';
            chatLog.appendChild(p);
        }
    }
}

// The URL for your Netlify serverless function.
// IMPORTANT: This will be the URL of your Netlify site.
const functionUrl = 'https://unique-gingersnap-b64334.netlify.app/.netlify/functions/openai-proxy';

async function sendMessages() {
    const last = messageHistory[messageHistory.length - 1];
    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: last.content })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    messageHistory.push({ role: 'assistant', content: data.reply });
    renderChatLog();
    responseContainer.classList.remove('hidden');
}

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
        messageHistory.push({ role: 'user', content: userPrompt });
        renderChatLog();
        await sendMessages();
    } catch (error) {
        // Show any errors to the user
        console.error('Error fetching AI response:', error);
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

// Fetch the initial scenario when the page loads
window.addEventListener('DOMContentLoaded', async () => {
    setLoading(true);
    messageHistory.push({ role: 'user', content: 'Start the first scenario.' });
    renderChatLog();
    try {
        await sendMessages();
    } catch (error) {
        console.error('Error fetching initial scenario:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
});
