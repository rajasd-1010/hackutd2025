import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FinancePage } from './components/FinancePage';
import { ComparisonChat } from './components/ComparisonChat';
import { HeroSection } from './components/HeroSection';
import { ThemeToggle } from './components/ThemeToggle';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    drivetrain: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
    minMpg: '',
  });
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [chatHistory, setChatHistory] = useState([
    { from: 'bot', text: "Hello! I'm your AI assistant. I can help you find the perfect Toyota vehicle, compare models, estimate payments, and answer any questions. How can I assist you today?" },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [selectedZip, setSelectedZip] = useState('75201');
  const [paymentCalc, setPaymentCalc] = useState({
    price: 30000,
    downPayment: 2000,
    apr: 5.5,
    termMonths: 60,
    isLease: false,
    residualValue: 16500,
  });
  const [paymentResult, setPaymentResult] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showComparisonChat, setShowComparisonChat] = useState(false);
  const [chatVehicles, setChatVehicles] = useState([]);
  const [selectedVehicleForFinance, setSelectedVehicleForFinance] = useState(null);

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
    fetchDealers();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`);
      const data = await response.json();
      setVehicles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await fetch(`${API_BASE}/dealers?zip=${selectedZip}`);
      const data = await response.json();
      setDealers(data);
    } catch (error) {
      console.error('Error fetching dealers:', error);
    }
  };

  // Filter vehicles with real-time updates
  const filteredVehicles = useMemo(() => {
    if (vehicles.length === 0) return [];
    
    return vehicles.filter(vehicle => {
      // Search query matching
      const matchesSearch = !searchQuery || 
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.description && vehicle.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter matching with improved logic
      const matchesType = !filters.type || 
        vehicle.type === filters.type ||
        (filters.type === 'SUV' && vehicle.type.includes('SUV'));
      const matchesDrivetrain = !filters.drivetrain || vehicle.drivetrain === filters.drivetrain;
      const matchesFuelType = !filters.fuelType || vehicle.fuelType === filters.fuelType;
      const matchesMinPrice = !filters.minPrice || vehicle.price >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || vehicle.price <= parseInt(filters.maxPrice);
      const matchesMinMpg = !filters.minMpg || vehicle.mpg >= parseInt(filters.minMpg);

      return matchesSearch && matchesType && matchesDrivetrain && matchesFuelType && 
             matchesMinPrice && matchesMaxPrice && matchesMinMpg;
    });
  }, [vehicles, searchQuery, filters]);

  // Toggle vehicle selection for comparison
  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else if (prev.length < 3) {
        return [...prev, vehicleId];
      }
      return prev;
    });
  };

  // Handle AI chat with vehicle display
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { from: 'user', text: chatInput };
    const userInput = chatInput;
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: chatHistory.map(msg => ({
            role: msg.from === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
        }),
      });

      const data = await response.json();
      setChatHistory(prev => [...prev, { from: 'bot', text: data.response }]);
      
      // If vehicles were found, display them
      if (data.vehicles && data.vehicles.length > 0) {
        setChatVehicles(data.vehicles);
        // Apply filters based on found vehicles
        if (data.action === 'search') {
          // Optionally auto-apply filters or show vehicles
        }
      } else {
        setChatVehicles([]);
      }

      // If it's a comparison request, suggest using compare feature
      if (data.action === 'compare') {
        setChatHistory(prev => [...prev, {
          from: 'bot',
          text: 'I can help you compare vehicles! Click the "Compare" button in the navigation to open the comparison tool.',
        }]);
      }
    } catch (error) {
      console.error('Error chatting:', error);
      setChatHistory(prev => [...prev, { 
        from: 'bot', 
        text: 'Sorry, I encountered an error. Please make sure the server is running and try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Calculate payment
  const calculatePayment = async () => {
    try {
      const response = await fetch(`${API_BASE}/calculate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentCalc),
      });

      const data = await response.json();
      setPaymentResult(data);
    } catch (error) {
      console.error('Error calculating payment:', error);
    }
  };

  useEffect(() => {
    calculatePayment();
  }, [paymentCalc]);

  // Request dealer offers
  const requestDealerOffers = async (vehicleId) => {
    try {
      const response = await fetch(`${API_BASE}/request-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, zip: selectedZip }),
      });

      const offers = await response.json();
      alert(`Found ${offers.length} dealer offers! Check the console for details.`);
      console.log('Dealer offers:', offers);
    } catch (error) {
      console.error('Error requesting offers:', error);
    }
  };

  const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      {/* Hero Section - Show only on browse tab */}
      {activeTab === 'browse' && !searchQuery && filteredVehicles.length === vehicles.length && (
        <HeroSection />
      )}

      {/* Header */}
      <header 
        className="glass-card border-b border-white/10 sticky top-0 z-50 backdrop-blur-2xl"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold font-display" style={{ color: 'var(--toyota-red)' }}>
                TOYOTA
              </div>
              <div className="hidden md:block text-sm" style={{ color: 'var(--text-secondary)' }}>
                AI-Powered Vehicle Shopping
              </div>
            </div>
            <nav className="flex gap-6 items-center" role="navigation" aria-label="Main navigation">
              <ThemeToggle />
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'browse'
                    ? 'bg-toyota-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Browse
              </button>
              <button
                onClick={() => {
                  setActiveTab('compare');
                  setShowComparisonChat(true);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'compare'
                    ? 'bg-toyota-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Compare {selectedVehicles.length > 0 && `(${selectedVehicles.length})`}
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'finance'
                    ? 'bg-toyota-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Finance
              </button>
              <button
                onClick={() => setActiveTab('dealers')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'dealers'
                    ? 'bg-toyota-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dealers
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gradient">Filters</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search vehicles..."
                      className="input-glass w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="input-glass w-full"
                    >
                      <option value="">All Types</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Compact">Compact</option>
                      <option value="Compact SUV">Compact SUV</option>
                      <option value="Midsize SUV">Midsize SUV</option>
                      <option value="Full-Size SUV">Full-Size SUV</option>
                      <option value="Midsize Truck">Midsize Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Drivetrain</label>
                    <select
                      value={filters.drivetrain}
                      onChange={(e) => setFilters({ ...filters, drivetrain: e.target.value })}
                      className="input-glass w-full"
                    >
                      <option value="">All</option>
                      <option value="FWD">FWD</option>
                      <option value="AWD">AWD</option>
                      <option value="4WD">4WD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fuel Type</label>
                    <select
                      value={filters.fuelType}
                      onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                      className="input-glass w-full"
                    >
                      <option value="">All</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        placeholder="Min"
                        className="input-glass w-full"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        placeholder="Max"
                        className="input-glass w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min MPG</label>
                    <input
                      type="number"
                      value={filters.minMpg}
                      onChange={(e) => setFilters({ ...filters, minMpg: e.target.value })}
                      placeholder="Min MPG"
                      className="input-glass w-full"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setFilters({
                        type: '',
                        drivetrain: '',
                        fuelType: '',
                        minPrice: '',
                        maxPrice: '',
                        minMpg: '',
                      });
                      setSearchQuery('');
                    }}
                    className="btn-toyota-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </aside>

            {/* Vehicle Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2 text-gradient">Explore Toyota Vehicles</h1>
                <p className="text-gray-400">
                  {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-toyota-red"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      index={index}
                      isSelected={selectedVehicles.includes(vehicle.id)}
                      onSelect={() => toggleVehicleSelection(vehicle.id)}
                      onRequestOffers={() => requestDealerOffers(vehicle.id)}
                      onFinanceClick={() => {
                        setSelectedVehicleForFinance(vehicle);
                        setActiveTab('finance');
                      }}
                    />
                  ))}
                </div>
              )}

              {filteredVehicles.length === 0 && !loading && (
                <div className="glass-card p-12 text-center">
                  <p className="text-gray-400 text-lg">No vehicles found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <>
            {showComparisonChat ? (
              <ComparisonChat
                onComparisonComplete={(comparison) => {
                  console.log('Comparison complete:', comparison);
                  // Optionally update selected vehicles
                  setSelectedVehicles([
                    comparison.vehicle1.id,
                    comparison.vehicle2.id,
                  ]);
                }}
                onClose={() => setShowComparisonChat(false)}
              />
            ) : (
              <ComparisonView
                vehicles={selectedVehiclesData}
                allVehicles={vehicles}
                onSelectVehicle={toggleVehicleSelection}
                selectedIds={selectedVehicles}
              />
            )}
            {!showComparisonChat && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowComparisonChat(true)}
                  className="btn-toyota"
                >
                  Open Smart Comparison Chat
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'finance' && (
          <FinancePage
            vehicles={vehicles}
            selectedVehicle={selectedVehicleForFinance || (selectedVehiclesData.length > 0 ? selectedVehiclesData[0] : null)}
          />
        )}

        {activeTab === 'dealers' && (
          <DealerView dealers={dealers} selectedZip={selectedZip} setSelectedZip={setSelectedZip} onZipChange={fetchDealers} />
        )}
      </main>

      {/* AI Chatbot - Floating */}
      <AIChatbot
        chatHistory={chatHistory}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSend={handleChatSend}
        loading={chatLoading}
        vehicles={chatVehicles}
        onVehicleSelect={(vehicle) => {
          setSelectedVehicleForFinance(vehicle);
          setActiveTab('finance');
        }}
      />

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-400 text-sm">
          <p>© 2025 Toyota AI Shopping Experience. Built with innovation and precision.</p>
        </div>
      </footer>
    </div>
  );
}

// Vehicle Card Component
function VehicleCard({ vehicle, index, isSelected, onSelect, onRequestOffers, onFinanceClick }) {
  return (
    <div
      className={`glass-card glass-card-hover p-6 animate-fade-in ${
        isSelected ? 'ring-2 ring-toyota-red' : ''
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 h-48">
        <img
          src={vehicle.image}
          alt={vehicle.model}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/1a1a1a/e60012?text=' + encodeURIComponent(vehicle.model);
          }}
        />
        {vehicle.fuelType === 'Hybrid' || vehicle.fuelType === 'Plug-in Hybrid' ? (
          <div className="absolute top-2 right-2 bg-toyota-red px-3 py-1 rounded-full text-xs font-semibold">
            {vehicle.fuelType}
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1">{vehicle.model}</h3>
        <p className="text-gray-400 text-sm mb-2">{vehicle.year} • {vehicle.type}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300">💰 ${vehicle.price.toLocaleString()}</span>
          <span className="text-gray-300">⛽ {vehicle.mpg} MPG</span>
          <span className="text-gray-300">🚗 {vehicle.drivetrain}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onSelect}
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            isSelected
              ? 'bg-toyota-red text-white'
              : 'btn-toyota-outline'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Select to Compare'}
        </button>
        <button
          onClick={onRequestOffers}
          className="w-full py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
        >
          Request Offers
        </button>
        {onFinanceClick && (
          <button
            onClick={onFinanceClick}
            className="w-full py-2 rounded-lg border border-toyota-red/50 text-toyota-red hover:bg-toyota-red/10 transition-all"
          >
            Finance Options
          </button>
        )}
      </div>
    </div>
  );
}

// Comparison View Component
function ComparisonView({ vehicles, allVehicles, onSelectVehicle, selectedIds }) {
  if (vehicles.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gradient">Compare Vehicles</h2>
        <p className="text-gray-400 mb-6">Select up to 3 vehicles to compare side-by-side.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {allVehicles.slice(0, 6).map(vehicle => (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle.id)}
              className="glass-card glass-card-hover p-4 cursor-pointer"
            >
              <h3 className="font-semibold">{vehicle.model}</h3>
              <p className="text-sm text-gray-400">${vehicle.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const comparisonFields = [
    { label: 'Price', key: 'price', format: (v) => `$${v.toLocaleString()}` },
    { label: 'MPG', key: 'mpg', format: (v) => v },
    { label: 'City MPG', key: 'cityMpg', format: (v) => v },
    { label: 'Highway MPG', key: 'highwayMpg', format: (v) => v },
    { label: 'Engine', key: 'engine', format: (v) => v },
    { label: 'Horsepower', key: 'horsepower', format: (v) => `${v} HP` },
    { label: 'Transmission', key: 'transmission', format: (v) => v },
    { label: 'Drivetrain', key: 'drivetrain', format: (v) => v },
    { label: 'Fuel Type', key: 'fuelType', format: (v) => v },
    { label: 'Seats', key: 'seats', format: (v) => v },
    { label: 'Type', key: 'type', format: (v) => v },
  ];

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6 text-gradient">Vehicle Comparison</h2>
      <div className="glass-card p-6 overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-4 font-semibold">Specification</th>
              {vehicles.map(vehicle => (
                <th key={vehicle.id} className="text-left py-4 px-4">
                  <div className="font-bold text-lg">{vehicle.model}</div>
                  <div className="text-sm text-gray-400">{vehicle.year}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map(field => (
              <tr key={field.key} className="border-b border-white/5">
                <td className="py-4 px-4 font-semibold text-gray-300">{field.label}</td>
                {vehicles.map(vehicle => (
                  <td key={vehicle.id} className="py-4 px-4">
                    {field.format(vehicle[field.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => {
            vehicles.forEach(v => onSelectVehicle(v.id));
          }}
          className="btn-toyota-outline"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}


// Dealer View Component
function DealerView({ dealers, selectedZip, setSelectedZip, onZipChange }) {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-6 text-gradient">Find a Dealer</h2>
      
      <div className="glass-card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={selectedZip}
            onChange={(e) => setSelectedZip(e.target.value)}
            placeholder="Enter zip code"
            className="input-glass flex-1"
          />
          <button onClick={onZipChange} className="btn-toyota">
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealers.map(dealer => (
          <div key={dealer.id} className="glass-card glass-card-hover p-6">
            <h3 className="text-xl font-bold mb-2">{dealer.name}</h3>
            <p className="text-gray-400 mb-4">{dealer.city}, {dealer.state} {dealer.zip}</p>
            <p className="text-gray-300 mb-4">{dealer.phone}</p>
            <button className="btn-toyota-outline w-full">Contact Dealer</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Chatbot Component
function AIChatbot({ chatHistory, chatInput, setChatInput, onSend, loading, vehicles = [], onVehicleSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, vehicles]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-toyota-red rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-white text-2xl z-50 animate-glow"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[700px] glass-card border border-white/20 shadow-2xl z-50 flex flex-col animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-gradient">AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.from === 'user'
                      ? 'bg-toyota-red text-white'
                      : 'bg-white/10 text-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Display matching vehicles */}
            {vehicles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-300 mb-2">
                  Matching Vehicles ({vehicles.length}):
                </div>
                {vehicles.slice(0, 3).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="glass-card glass-card-hover p-3 cursor-pointer"
                    onClick={() => {
                      if (onVehicleSelect) {
                        onVehicleSelect(vehicle);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs text-gray-400">
                          ${vehicle.price.toLocaleString()} • {vehicle.mpg} MPG • {vehicle.type}
                        </div>
                      </div>
                      <button className="text-toyota-red text-xs font-semibold hover:underline">
                        View →
                      </button>
                    </div>
                  </div>
                ))}
                {vehicles.length > 3 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{vehicles.length - 3} more vehicles
                  </div>
                )}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSend()}
                placeholder="Ask me anything..."
                className="input-glass flex-1"
                disabled={loading}
              />
              <button
                onClick={onSend}
                disabled={loading}
                className="btn-toyota"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
