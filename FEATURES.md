# Toyota Finance Web App - Feature Documentation

## 🎯 Overview

This is a fully functional Toyota Finance web application with AI-powered features, intelligent vehicle search, comparison tools, and comprehensive financing options. All features are connected to a working backend with real-time data processing.

## 🚀 Key Features

### 1. Intelligent Vehicle Search & Filtering

**Real-time Filtering:**
- Filters update instantly as you type or change values
- Search by vehicle name, type, make, or description
- Filter by:
  - Vehicle type (Sedan, SUV, Compact, Truck)
  - Drivetrain (FWD, AWD, 4WD)
  - Fuel type (Gasoline, Hybrid, Plug-in Hybrid)
  - Price range (min/max)
  - MPG (minimum)

**Natural Language Search:**
- The AI chatbot can parse queries like:
  - "Show me affordable hybrid SUVs"
  - "Find cars under $30k"
  - "Toyota vehicles with AWD"
- Automatically applies filters and displays matching vehicles

### 2. AI-Powered Chatbot

**Features:**
- Natural language understanding
- Contextual responses about vehicles, financing, and comparisons
- Displays matching vehicles when queries are search-related
- Click on any displayed vehicle to view finance options
- Integrated with OpenAI API for intelligent responses

**Example Queries:**
- "Show me affordable hybrid SUVs"
- "Compare Toyota Camry with Honda Accord"
- "What's the best SUV under $35k?"
- "Explain lease vs buy options"

### 3. Smart Vehicle Comparison

**Two Comparison Modes:**

1. **Traditional Comparison:**
   - Select up to 3 vehicles from the browse page
   - View side-by-side comparison table
   - Compare specs: price, MPG, engine, horsepower, drivetrain, etc.

2. **Smart Comparison Chat:**
   - Natural language comparison queries
   - Examples:
     - "Compare Toyota Camry with Honda Accord"
     - "Toyota RAV4 vs Mazda CX-5"
     - "Show me Camry vs Accord comparison"
   - Automatically finds both vehicles and displays:
     - Side-by-side specifications
     - Key differences (price, MPG, horsepower)
     - Similarities (type, drivetrain, fuel type)
   - Works with any brand (Toyota, Honda, Mazda, Ford, etc.)

### 4. Comprehensive Finance Calculator

**Three Financing Scenarios:**

1. **Purchase/Finance:**
   - Customizable down payment
   - Adjustable APR
   - Term length (36-84 months)
   - Trade-in value support
   - Tax calculation
   - Shows: Monthly payment, total cost, total interest

2. **Lease:**
   - Lower down payment options
   - Money factor calculation
   - Residual value (auto-calculated or manual)
   - Term length (24-48 months)
   - Trade-in value support
   - Shows: Monthly payment, total cost, residual value

3. **Subscription:**
   - All-inclusive monthly payment
   - Includes: Vehicle payment, insurance, maintenance
   - Lower down payment
   - Flexible terms
   - Shows: Monthly payment, total cost, breakdown

**Features:**
- Real-time calculations as you adjust sliders/inputs
- Expandable scenario cards with detailed breakdowns
- Trade-in value support for all scenarios
- Tax rate calculation (default 8%, customizable)
- Side-by-side comparison of all three options

### 5. Dealer Finder

**Features:**
- Search dealers by zip code
- Display nearby dealers with:
  - Dealer name and location
  - Contact information
  - Zip code matching
- Request dealer offers for specific vehicles
- Compare offers from multiple dealers

### 6. Vehicle Management

**Vehicle Cards:**
- Beautiful glassmorphic design
- Vehicle images with fallback placeholders
- Key specifications displayed
- Quick actions:
  - Select for comparison
  - Request dealer offers
  - View finance options
- Hover effects and smooth animations

**Vehicle Data:**
- 10+ Toyota models
- Non-Toyota vehicles for comparison (Honda, Mazda, Ford)
- Comprehensive specs:
  - Price, MPG (city/highway)
  - Engine, horsepower, transmission
  - Drivetrain, fuel type, seats
  - Features and descriptions

## 🔧 Technical Implementation

### Backend API Endpoints

1. **GET /api/vehicles**
   - Returns all vehicles
   - Real-time data

2. **GET /api/vehicles/:id**
   - Returns specific vehicle by ID

3. **POST /api/vehicles/search**
   - Natural language search
   - Returns matching vehicles with applied filters

4. **POST /api/compare**
   - Compare two vehicles
   - Accepts vehicle IDs or natural language query
   - Returns comparison data with differences and similarities

5. **POST /api/chat**
   - AI chatbot endpoint
   - Parses natural language queries
   - Returns AI response + matching vehicles (if search query)
   - Supports conversation history

6. **POST /api/calculate-payment**
   - Calculate payment for buy/lease/subscription
   - Supports trade-in value, tax, down payment
   - Returns monthly payment, total cost, breakdown

7. **POST /api/request-offers**
   - Request dealer offers for a vehicle
   - Returns offers from multiple dealers

8. **GET /api/dealers**
   - Get dealers by zip code
   - Returns nearby dealers

### Natural Language Processing

The backend includes intelligent query parsing that extracts:
- Vehicle type (SUV, sedan, truck, etc.)
- Drivetrain (AWD, FWD, 4WD)
- Fuel type (Hybrid, Gasoline, Plug-in Hybrid)
- Price range (under $X, $X-$Y, affordable, luxury)
- MPG requirements
- Make and model names
- Comparison keywords (vs, versus, compare)

### Frontend Components

1. **App.jsx** - Main application with routing and state management
2. **FinancePage.jsx** - Finance calculator with three scenarios
3. **ScenarioCard.jsx** - Individual finance scenario card
4. **ComparisonChat.jsx** - Smart comparison chat interface
5. **AIChatbot** - Floating AI assistant
6. **VehicleCard** - Vehicle display card
7. **ComparisonView** - Traditional comparison table

## 🎨 Design Features

- **Dark Mode Theme** - Elegant dark interface
- **Glassmorphism** - Beautiful glass panels with backdrop blur
- **Smooth Animations** - Fade-in, slide-up, scale-in effects
- **Toyota Red Accents** - Signature #e60012 color
- **Modern Fonts** - Inter and Montserrat
- **Responsive Design** - Works on all devices
- **Hover Effects** - Interactive elements with smooth transitions

## 🚦 How to Use

### Searching Vehicles

1. Use the search bar or filters on the browse page
2. Or ask the AI chatbot: "Show me hybrid SUVs under $35k"
3. Click on vehicles to view details
4. Select vehicles for comparison

### Comparing Vehicles

**Method 1 - Traditional:**
1. Select up to 3 vehicles using "Select to Compare"
2. Go to Compare tab
3. View side-by-side comparison

**Method 2 - Smart Chat:**
1. Click "Compare" in navigation
2. Open "Smart Comparison Chat"
3. Type: "Compare Toyota Camry with Honda Accord"
4. View automatic comparison

### Calculating Payments

1. Select a vehicle or go to Finance tab
2. View three scenarios: Buy, Lease, Subscribe
3. Adjust:
   - Down payment (slider/input)
   - APR (input)
   - Term length (slider)
   - Trade-in value (input)
4. See real-time calculations
5. Expand scenarios for detailed breakdowns

### Using AI Chatbot

1. Click the chat bubble (bottom-right)
2. Ask questions like:
   - "Find affordable hybrid SUVs"
   - "Compare Toyota Camry with Honda Accord"
   - "What's the best SUV under $30k?"
   - "Explain lease options"
3. Click on displayed vehicles to view finance options
4. Chat supports conversation history

## 📊 Data Flow

1. **User Query** → Backend NLP Parser → Filters Applied → Vehicles Filtered
2. **AI Chat** → OpenAI API → Response + Matching Vehicles → Displayed
3. **Comparison** → Vehicle IDs/Names Parsed → Comparison Data → Displayed
4. **Finance Calc** → Parameters Sent → Backend Calculation → Results Displayed
5. **Filters** → Real-time Updates → Vehicle List Filtered → UI Updated

## 🔐 Security & Configuration

- OpenAI API key stored in `server/key.env`
- CORS enabled for development
- Environment variables for configuration
- Error handling for API failures
- Fallback responses when OpenAI unavailable

## 🎯 Future Enhancements

- Real-time inventory integration
- Credit score soft pull
- 3D vehicle viewer
- Virtual test drive scheduling
- Trade-in value API integration
- Financing application form
- Email/SMS notifications
- User accounts and saved searches
- Payment processing integration

## 📝 Notes

- All calculations are performed on the backend
- Vehicle data is currently simulated (can be replaced with real API)
- OpenAI API key required for full chatbot functionality
- Dealer data is mocked (can be integrated with real dealer APIs)
- All features are fully functional and connected to backend

---

**Built with React, Node.js, Express, OpenAI API, and Tailwind CSS**

