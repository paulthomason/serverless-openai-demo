// IMPORTANT: This code needs to be in a file named `openai-proxy.js`
// inside a `netlify/functions` directory in your project.

// Using the `node-fetch` library to make HTTP requests.
const fetch = require('node-fetch');

// The main handler for the serverless function.
exports.handler = async (event) => {
    // --- CORS Headers ---
    // Allow requests only from a trusted origin defined in the ALLOWED_ORIGIN environment variable.
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    if (allowedOrigin) {
        headers['Access-Control-Allow-Origin'] = allowedOrigin;
    }
    
    // An OPTIONS request is a "preflight" request that the browser sends
    // to check if the server will allow the actual POST request.
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content
            headers,
            body: ''
        };
    }

    // Only allow POST requests for the actual API call
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Get the OpenAI API Key from environment variables.
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'OpenAI API key not configured.' }),
        };
    }

    try {
        // Parse the incoming request body to get the user's prompt
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                headers,
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
                model: 'gpt-4.1',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
            }),
        });

        // Check if the OpenAI API call was successful
        if (!openAIResponse.ok) {
            const errorData = await openAIResponse.json();
            console.error('OpenAI API Error:', errorData);
            return {
                statusCode: openAIResponse.status,
                headers, // Add headers to error responses too
                body: JSON.stringify({ error: 'Failed to get response from OpenAI.' }),
            };
        }

        const data = await openAIResponse.json();
        const reply = data.choices[0].message.content;

        // Send the successful response back to the frontend
        return {
            statusCode: 200,
            headers, // Add headers to the success response
            body: JSON.stringify({ reply: reply.trim() }),
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            headers, // Add headers to the final catch block
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
