// IMPORTANT: This code needs to be in a file named `openai-proxy.js`
// inside a `netlify/functions` directory in your project.

// Using the `node-fetch` library to make HTTP requests.
// Netlify functions have this available.
const fetch = require('node-fetch');

// The main handler for the serverless function.
exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Get the OpenAI API Key from environment variables.
    // This is the secure way to store secrets.
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'OpenAI API key not configured.' }),
        };
    }

    try {
        // Parse the incoming request body to get the user's prompt
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required.' }),
            };
        }

        // --- Call the OpenAI API ---
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Or any other model you prefer
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150, // Limit the response length
            }),
        });

        // Check if the OpenAI API call was successful
        if (!openAIResponse.ok) {
            const errorData = await openAIResponse.json();
            console.error('OpenAI API Error:', errorData);
            return {
                statusCode: openAIResponse.status,
                body: JSON.stringify({ error: 'Failed to get response from OpenAI.' }),
            };
        }

        const data = await openAIResponse.json();
        const reply = data.choices[0].message.content;

        // Send the successful response back to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: reply.trim() }),
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
