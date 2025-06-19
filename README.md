# Serverless OpenAI Demo

This project demonstrates how to proxy requests to the OpenAI API through a Netlify serverless function.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Provide your OpenAI API key as an environment variable:

   ```bash
   export OPENAI_API_KEY=your-key-here
   ```

   When deploying to Netlify, set this variable in **Site settings → Environment variables**.

3. (Optional) Specify a trusted origin for CORS by setting `ALLOWED_ORIGIN`:

   ```bash
   export ALLOWED_ORIGIN=https://your-frontend-domain.com
   ```

## Deploying to Netlify

1. Install the Netlify CLI if you don't already have it:

   ```bash
   npm install -g netlify-cli
   ```

2. Deploy the site:

   ```bash
   netlify deploy --prod
   ```

   The function will be available at `https://your-site.netlify.app/.netlify/functions/openai-proxy`.

## Local Development

Use the Netlify CLI to serve the project locally:

```bash
netlify dev
```
