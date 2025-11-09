# Toyota Finance Web App - Production Ready

## 🎯 Overview

A production-ready, AI-powered Toyota Finance web application with a luxury dark/light theme, comprehensive vehicle data, intelligent NLU, and full backend integration.

## ✨ Key Features

### Frontend
- **Luxury Theme System** - Dark/light mode with Toyota red accents (#EB0A1E) and gold highlights (#C9A66B)
- **Hero Section** - Full-bleed carousel with Ken Burns effect and autoplay
- **Glassmorphism Design** - Premium glass panels with backdrop blur
- **Theme Toggle** - System preference detection with localStorage persistence
- **Responsive Layout** - Mobile-first design with ARIA roles
- **Smooth Animations** - 160-360ms transitions with reduced motion support
- **Finance Calculator** - Buy/Lease/Subscription scenarios with real-time calculations
- **Comparison UI** - Split-screen comparison with exact color/image mapping
- **AI Chatbot** - Natural language understanding with vehicle filtering

### Backend
- **Comprehensive Vehicle Data** - JSON dataset with VINs, trims, colors, dimensions
- **NLU System** - Entity extraction, fuzzy matching, color mapping, synonyms
- **Robust API Endpoints** - Filtering, pagination, search, comparison, chat
- **Error Handling** - Comprehensive error handling and validation
- **Health Checks** - `/health` endpoint for monitoring
- **Caching Ready** - CDN-friendly image URLs and response structure

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- OpenAI API key (for chatbot)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure OpenAI API key**
   ```bash
   # Create server/key.env
   OPENAI_API_KEY=your_api_key_here
   PORT=3001
   ```

3. **Start development servers**
   ```bash
   npm run dev:all
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Health: http://localhost:3001/health

## 📁 Project Structure

```
hackutd2025/
├── server/
│   ├── index.js              # Main server (enhanced)
│   ├── index.enhanced.js     # Production-ready server
│   ├── data/
│   │   └── vehicles.json     # Comprehensive vehicle data
│   ├── utils/
│   │   └── nlu.js            # NLU system
│   └── key.env               # Environment variables
├── src/
│   ├── components/
│   │   ├── FinancePage.jsx   # Finance calculator
│   │   ├── ComparisonChat.jsx # Smart comparison
│   │   ├── HeroSection.jsx   # Hero carousel
│   │   └── ThemeToggle.jsx   # Theme switcher
│   ├── styles/
│   │   └── theme.css         # Theme system
│   ├── App.jsx               # Main app
│   └── index.css             # Global styles
└── package.json
```

## 🎨 Theme System

### Colors
- **Primary Background**: #121317 (dark) / #FFFFFF (light)
- **Secondary Background**: #1B1D21 (dark) / #F7F7F8 (light)
- **Toyota Red**: #EB0A1E (accent)
- **Luxury Gold**: #C9A66B (highlights)
- **Glass Cards**: rgba(255,255,255,0.04) (dark) / rgba(255,255,255,0.8) (light)

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter Variable (body text)
- **Line Height**: 1.7 (premium feel)
- **Letter Spacing**: -0.01em (tuned)

### Animations
- **Fast**: 160ms ease-out
- **Base**: 220ms ease-out
- **Slow**: 360ms ease-out
- **Ken Burns**: 20s infinite alternate

## 🔌 API Endpoints

### GET /health
Health check endpoint.

### GET /api/vehicles
Get all vehicles with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Text search (fuzzy)
- `type` - Vehicle type filter
- `make` - Make filter
- `drivetrain` - Drivetrain filter
- `fuelType` - Fuel type filter
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `minMpg` - Minimum MPG

**Response:**
```json
{
  "vehicles": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /api/vehicles/:id
Get vehicle by ID.

### POST /api/vehicles/search
Natural language vehicle search.

**Request:**
```json
{
  "query": "affordable hybrid SUVs under $35k"
}
```

**Response:**
```json
{
  "vehicles": [...],
  "filters": {...},
  "count": 5,
  "intent": "search"
}
```

### POST /api/compare
Compare two vehicles.

**Request:**
```json
{
  "query": "blue Camry vs silver Accord",
  "vehicle1": "TOY-2025-CAM-LE-HYB-001",
  "vehicle2": "HON-2025-ACC-HYB-006",
  "color1": "blue",
  "color2": "silver"
}
```

**Response:**
```json
{
  "vehicle1": {...},
  "vehicle2": {...},
  "differences": {...},
  "similarities": [...],
  "financing": {...}
}
```

### POST /api/chat
AI chatbot with NLU.

**Request:**
```json
{
  "message": "show me affordable hybrid SUVs",
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "response": "I found 3 hybrid SUVs...",
  "vehicles": [...],
  "action": "search",
  "error": false
}
```

### POST /api/calculate-payment
Calculate financing options.

**Request:**
```json
{
  "price": 30000,
  "downPayment": 2000,
  "apr": 5.5,
  "termMonths": 60,
  "isLease": false,
  "isSubscription": false,
  "tradeInValue": 0,
  "taxRate": 0.08
}
```

**Response:**
```json
{
  "monthlyPayment": 450,
  "totalCost": 29000,
  "totalInterest": 2000,
  "breakdown": {...},
  "type": "purchase"
}
```

## 🧠 NLU System

The NLU system (`server/utils/nlu.js`) provides:

- **Entity Extraction** - Vehicle models, makes, colors, prices
- **Fuzzy Matching** - Handles typos and variations
- **Color Mapping** - Maps color names to vehicle colors
- **Intent Detection** - Search, compare, filter, finance
- **Price Parsing** - Extracts price ranges from text
- **Synonym Support** - Handles variations and aliases

### Example Queries
- "affordable hybrid SUVs" → Filters: fuelType=Hybrid, type=SUV, maxPrice=30000
- "blue Camry vs silver Accord" → Comparison with color mapping
- "Toyota vehicles under $30k" → Filters: make=Toyota, maxPrice=30000
- "efficient sedans with AWD" → Filters: type=Sedan, drivetrain=AWD, minMpg=35

## 🎯 Vehicle Data Schema

```json
{
  "id": "TOY-2025-CAM-LE-HYB-001",
  "vin": "4T1B11HK5KU123456",
  "make": "Toyota",
  "model": "Camry",
  "trim": "LE Hybrid",
  "year": 2025,
  "msrp": 30000,
  "dealerPrice": 28500,
  "type": "Sedan",
  "category": "Midsize",
  "mpg": {
    "combined": 52,
    "city": 51,
    "highway": 53
  },
  "drivetrain": "FWD",
  "electrified": true,
  "fuelType": "Hybrid",
  "engine": {
    "displacement": "2.5L",
    "cylinders": 4,
    "type": "Hybrid",
    "horsepower": 208,
    "torque": 163
  },
  "colors": [
    {
      "name": "Ice Cap",
      "code": "ICE",
      "imageUrl": "https://...",
      "hex": "#F5F5F0"
    }
  ],
  "dimensions": {
    "length": 192.1,
    "width": 72.4,
    "height": 56.9,
    "wheelbase": 111.2
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Environment Variables
```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_key
```

### Health Check
Monitor `/health` endpoint for uptime.

## 📝 Notes

- Vehicle images use CDN-friendly URLs
- Color mapping gracefully falls back to defaults
- NLU system handles ambiguous queries
- Theme persists in localStorage
- All animations respect reduced motion preferences
- ARIA roles for accessibility
- Keyboard navigation supported

## 🔧 Troubleshooting

### Images not loading
- Check CDN URLs in vehicle data
- Verify image URLs are accessible
- Fallback placeholders will display

### NLU not parsing correctly
- Check query format
- Review NLU logs
- Try rephrasing query

### Theme not applying
- Clear localStorage
- Check browser console
- Verify CSS variables

## 📚 Documentation

- [API Documentation](./API.md)
- [NLU System](./NLU.md)
- [Theme System](./THEME.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Built with React, Node.js, Express, OpenAI API, and Tailwind CSS**

