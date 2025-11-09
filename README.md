# Toyota AI-Powered Shopping & Finance Platform

A modern, AI-powered web application that transforms how people explore and buy Toyota vehicles. Features a luxurious dark mode design with glassmorphism effects, smooth animations, and an intelligent AI chatbot powered by OpenAI.

## 🚀 Features

### 🎨 Design
- **Dark Mode Theme** - Elegant dark interface with premium visual depth
- **Glassmorphism Effects** - Beautiful glass panels with backdrop blur
- **Smooth Animations** - Fluid transitions and hover effects throughout
- **Toyota Brand Identity** - Signature red accents (#e60012) with modern fonts (Inter/Montserrat)
- **Responsive Design** - Works seamlessly on all devices

### 🤖 AI-Powered Features
- **Intelligent Chatbot** - OpenAI-powered assistant that answers questions about vehicles, financing, and comparisons
- **Natural Language Search** - Ask questions like "Find a hybrid AWD under $35k"
- **Vehicle Recommendations** - Get personalized suggestions based on your needs

### 🚗 Vehicle Management
- **Advanced Search & Filters** - Filter by type, drivetrain, fuel type, price range, and MPG
- **Vehicle Comparison** - Compare up to 3 vehicles side-by-side
- **Detailed Specs** - View comprehensive vehicle information including performance, features, and pricing

### 💰 Finance Tools
- **Payment Estimator** - Calculate monthly payments for buying or leasing
- **Buy vs Lease Calculator** - Compare financing options
- **Customizable Terms** - Adjust down payment, APR, and term length

### 🏪 Dealer Features
- **Dealer Finder** - Locate nearby Toyota dealers by zip code
- **Dealer Offers** - Request and compare offers from multiple dealers
- **Contact Integration** - Easy dealer contact options

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackutd2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up OpenAI API Key**
   
   Create a file `server/key.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   PORT=3001
   ```
   
   > **Note:** Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Start the development server**
   
   Run both the backend and frontend:
   ```bash
   npm run dev:all
   ```
   
   Or run them separately:
   ```bash
   # Terminal 1 - Backend server
   npm run server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Glassmorphism** - Premium glass effects

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **OpenAI API** - AI chatbot integration
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
hackutd2025/
├── server/
│   ├── index.js          # Express server with API endpoints
│   └── key.env           # Environment variables (create this)
├── src/
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global styles with Tailwind
│   └── main.jsx          # React entry point
├── public/               # Static assets
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## 🎯 Usage

### Browse Vehicles
1. Navigate to the **Browse** tab
2. Use the search bar or filters to find vehicles
3. Click "Select to Compare" to add vehicles to comparison
4. Click "Request Offers" to get dealer quotes

### Compare Vehicles
1. Select up to 3 vehicles using "Select to Compare"
2. Navigate to the **Compare** tab
3. View side-by-side comparisons of specifications

### Finance Calculator
1. Navigate to the **Finance** tab
2. Enter vehicle price, down payment, APR, and term
3. Toggle between Buy and Lease options
4. View monthly payment and total cost breakdown

### AI Chatbot
1. Click the chat bubble in the bottom-right corner
2. Ask questions about vehicles, financing, or comparisons
3. Get intelligent responses powered by OpenAI

### Find Dealers
1. Navigate to the **Dealers** tab
2. Enter your zip code
3. View nearby Toyota dealers
4. Contact dealers directly

## 🔧 Configuration

### Server Port
Default port is `3001`. Change it in `server/key.env`:
```
PORT=3001
```

### OpenAI Model
The chatbot uses `gpt-4o-mini` by default. Change it in `server/index.js`:
```javascript
model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo', etc.
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize colors:
```javascript
colors: {
  toyota: {
    red: '#e60012',        // Toyota red
    dark: '#0b0b0d',       // Dark background
    'dark-secondary': '#0f1724', // Secondary dark
  },
}
```

### Fonts
Fonts are imported in `src/index.css`. Change them in the `@import` statement.

## 🚧 Future Enhancements

- [ ] Real-time inventory integration
- [ ] Credit score soft pull integration
- [ ] Interactive 3D vehicle viewer
- [ ] Virtual test drive scheduling
- [ ] Trade-in value calculator
- [ ] Financing application form
- [ ] Email/SMS notifications
- [ ] User accounts and saved searches

## 📝 API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID

### Dealers
- `GET /api/dealers` - Get all dealers
- `GET /api/dealers?zip=75201` - Get dealers by zip
- `GET /api/dealers/:id` - Get dealer by ID

### Chat
- `POST /api/chat` - Send message to AI chatbot
  ```json
  {
    "message": "Find a hybrid under $30k",
    "conversationHistory": []
  }
  ```

### Finance
- `POST /api/calculate-payment` - Calculate payment
  ```json
  {
    "price": 30000,
    "downPayment": 2000,
    "apr": 5.5,
    "termMonths": 60,
    "isLease": false
  }
  ```

### Offers
- `POST /api/request-offers` - Request dealer offers
  ```json
  {
    "vehicleId": "camry-hybrid-2025-le",
    "zip": "75201"
  }
  ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Toyota for inspiration
- OpenAI for AI capabilities
- Unsplash for vehicle images
- The open-source community

## 💡 Tips

- Make sure your OpenAI API key has sufficient credits
- The server must be running for the chatbot to work
- Vehicle images are placeholder URLs - replace with real images in production
- Dealer data is mocked - integrate with real dealer APIs for production

## 🐛 Troubleshooting

### Chatbot not working
- Check that `server/key.env` has a valid `OPENAI_API_KEY`
- Ensure the server is running on port 3001
- Check browser console for CORS errors

### Styles not loading
- Run `npm install` to ensure Tailwind is installed
- Check that `tailwind.config.js` exists
- Restart the dev server

### Server errors
- Check that port 3001 is not in use
- Verify all dependencies are installed
- Check server console for error messages

---

**Built with ❤️ for HackUTD 2025**
