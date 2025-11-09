# Toyota Finance App - Runbook

## 🚀 Quick Start for Judges

### Prerequisites
- Node.js v20+
- Docker & Docker Compose (optional)
- OpenAI API key (optional, for full chatbot)

### Option 1: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   # Create server/key.env
   echo "OPENAI_API_KEY=your_key_here" > server/key.env
   echo "PORT=3001" >> server/key.env
   ```

3. **Start servers**
   ```bash
   npm run dev:all
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Health: http://localhost:3001/health

### Option 2: Docker Compose

1. **Start all services**
   ```bash
   docker-compose up
   ```

2. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## ✅ Verification Checklist

### 1. Verify /vehicles Endpoint
```bash
curl http://localhost:3001/api/vehicles
```

**Expected:**
- Returns array of vehicles
- All vehicles are Toyota, Honda, Mazda, or Ford (no BMW/Audi)
- Each vehicle has: id, vin, make, model, msrp, colors, images

### 2. Verify Image URLs
```bash
# Check first vehicle's image
curl -I $(curl -s http://localhost:3001/api/vehicles | jq -r '.vehicles[0].colors[0].imageUrl')
```

**Expected:**
- HTTP 200, 301, or 302 (redirects OK)
- Or placeholder URL if image unavailable

### 3. Test Natural Language Queries

**Via API:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "show me offroad cars"}'
```

**Via UI:**
1. Open http://localhost:5173
2. Click chat button (💬)
3. Type: "show me offroad cars"
4. Verify vehicles are displayed

### 4. Test Comparison

**Via API:**
```bash
curl -X POST http://localhost:3001/api/compare \
  -H "Content-Type: application/json" \
  -d '{"query": "blue Camry vs silver Accord"}'
```

**Via UI:**
1. Click "Compare" tab
2. Click "Open Smart Comparison Chat"
3. Type: "blue Camry vs silver Accord"
4. Verify split-screen comparison appears
5. Verify exact color images are shown

### 5. Test Financing Calculator

1. Navigate to "Finance" tab
2. Select a vehicle (or use default)
3. Adjust sliders:
   - Down payment: $0 - $10,000
   - APR: 0% - 10%
   - Term: 36 - 84 months
   - Trade-in: $0 - $20,000
4. Verify calculations update instantly
5. Expand each scenario (Buy/Lease/Subscribe)
6. Verify breakdowns are accurate

### 6. Test Accessibility Features

1. **Theme Toggle**
   - Click theme toggle in header
   - Verify dark/light mode switches
   - Check localStorage persistence

2. **Kid/Senior Modes**
   - Open accessibility controls
   - Switch to "Kid Mode" or "Senior Mode"
   - Verify larger buttons and text
   - Test quick action chips

3. **Voice Controls**
   - Enable voice controls
   - Click voice button
   - Speak a query
   - Verify input is processed

4. **Keyboard Navigation**
   - Enable keyboard-only mode
   - Tab through interface
   - Verify all interactive elements are accessible
   - Press Enter to activate buttons

5. **Screen Reader**
   - Enable screen reader (NVDA/JAWS/VoiceOver)
   - Navigate through app
   - Verify announcements for updates

### 7. Test Real-time Updates

1. Open browser DevTools → Network → WS
2. Filter vehicles
3. Verify WebSocket messages for updates
4. Check that UI updates without page refresh

### 8. Run E2E Tests

```bash
npm run test:e2e
```

**Expected:**
- All tests pass
- Natural language queries work
- Comparisons display correctly
- Images and colors match

## 🐛 Troubleshooting

### Server won't start
- Check port 3001 is available
- Verify `server/key.env` exists
- Check Node.js version (v20+)

### Images not loading
- Check CDN URLs in vehicle data
- Verify network connectivity
- Check browser console for CORS errors

### Chatbot not responding
- Verify OpenAI API key in `server/key.env`
- Check server logs for errors
- Test `/health` endpoint

### TypeScript errors
- Run `npm run type-check`
- Verify all imports are correct
- Check `tsconfig.json` paths

### Tests failing
- Ensure servers are running
- Check test environment variables
- Verify test data matches schema

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "openai": "ok",
    "imageService": "ok"
  }
}
```

### Logs
- Server logs: Console output
- Request logs: Include requestId for tracing
- Error logs: Structured JSON format

## 🔍 Sample Queries to Test

### Search Queries
- "show me affordable hybrid SUVs"
- "find Toyota vehicles under $30k"
- "efficient sedans with AWD"
- "offroad cars"

### Comparison Queries
- "blue Camry vs silver Accord"
- "Toyota RAV4 vs Honda CR-V"
- "compare hybrid sedans"

### Finance Queries
- "what's the monthly payment for a $30k car"
- "lease vs buy comparison"
- "subscription options"

## 📝 Notes

- All calculations are deterministic and unit-tested
- Image service validates URLs and provides placeholders
- NLU system handles fuzzy matching and synonyms
- Real-time updates via WebSockets
- Full TypeScript type safety
- Comprehensive error handling

---

**For issues, check server logs and browser console for detailed error messages.**

