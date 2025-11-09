# Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
Create a file `server/key.env`:
```bash
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
```

Or copy the example file:
```bash
cp server/key.env.example server/key.env
```
Then edit `server/key.env` and add your API key.

### 3. Start the Application

**Option A: Run both servers together (Recommended)**
```bash
npm run dev:all
```

**Option B: Run servers separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

## Troubleshooting

### Chatbot not responding?
- ✅ Check that `server/key.env` exists and has a valid `OPENAI_API_KEY`
- ✅ Verify the backend server is running on port 3001
- ✅ Check browser console for errors
- ✅ Ensure you have OpenAI API credits

### Styles not loading?
- ✅ Run `npm install` to ensure all dependencies are installed
- ✅ Restart the dev server
- ✅ Clear browser cache

### Server won't start?
- ✅ Check if port 3001 is already in use
- ✅ Verify Node.js version (v18+)
- ✅ Check `server/key.env` file exists

### CORS errors?
- ✅ Ensure backend server is running
- ✅ Check that API_BASE in App.jsx matches your server URL
- ✅ Verify CORS is enabled in server/index.js

## Features to Test

1. **Browse Vehicles** - Use filters to find vehicles
2. **Compare** - Select up to 3 vehicles to compare
3. **Finance Calculator** - Calculate monthly payments
4. **AI Chatbot** - Ask questions about vehicles
5. **Dealer Finder** - Find nearby dealers by zip code

## Next Steps

- Replace placeholder vehicle images with real Toyota images
- Integrate with real Toyota APIs for inventory
- Add user authentication
- Connect to real dealer databases
- Add payment processing integration

## Need Help?

Check the main README.md for more detailed information.

