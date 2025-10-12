# AI Blueprint Generator Setup

## Required Configuration

To use the AI Blueprint Generator, you need to configure your OpenAI API key.

### For Bolt Preview (Development):

1. Go to your Bolt project settings
2. Navigate to "Secrets" or "Environment Variables"
3. Add a new secret with the name: `VITE_OPENAI_API_KEY`
4. Paste your OpenAI API key as the value
5. Save the changes
6. Refresh your Bolt preview

### For Live Site (pootleplayground.com):

1. Go to your Netlify dashboard
2. Navigate to: Site settings → Environment variables
3. Add a new variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
4. Save and redeploy your site

## How to Get an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)
5. Add it to your environment variables as described above

## Testing

Once configured:
- **In Bolt**: Click the AI button in the header, enter a prompt, and generate a blueprint
- **On Live Site**: Same process - the AI generation will work automatically

## Troubleshooting

If you see "OpenAI API key is not configured":
1. Make sure the secret name is exactly `VITE_OPENAI_API_KEY` in Bolt
2. Make sure the secret name is exactly `OPENAI_API_KEY` in Netlify
3. After adding the secret, refresh the page
4. Check the browser console for any error messages
