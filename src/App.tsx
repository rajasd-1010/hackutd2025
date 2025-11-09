/**
 * Main App Component (TypeScript)
 * Integrates all features with accessibility support
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import FinancePage from './components/FinancePage';
import { ComparisonChat } from './components/ComparisonChat';
import { ComparisonSplitScreen } from './components/ComparisonSplitScreen';
import { HeroSection } from './components/HeroSection';
import { ThemeToggle } from './components/ThemeToggle';
import { AccessibilityProvider, useAccessibility } from './components/AccessibilityProvider';
import { AccessibilityControls } from './components/AccessibilityControls';
import type { Vehicle, ComparisonResult, ChatResponse, RealtimeUpdate } from './types';

const API_BASE = 'http://localhost:3001/api';

function AppContent() {
  const { settings, announceToScreenReader } = useAccessibility();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'compare' | 'finance' | 'dealers'>('browse');
  const [chatHistory, setChatHistory] = useState<Array<{ from: 'user' | 'bot'; text: string }>>([
    { from: 'bot', text: "Hello! I'm your AI assistant. I can help you find the perfect Toyota vehicle, compare models, estimate payments, and answer any questions. How can I assist you today?" },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatVehicles, setChatVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleForFinance, setSelectedVehicleForFinance] = useState<Vehicle | null>(null);
  const [showComparisonChat, setShowComparisonChat] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('vehicles_update', (update: RealtimeUpdate) => {
      if (update.type === 'vehicle_list') {
        setVehicles(update.data.vehicles || []);
        announceToScreenReader('Vehicle list updated');
      }
    });

    newSocket.on('payment_update', (update: RealtimeUpdate) => {
      announceToScreenReader('Payment calculation updated');
    });

    return () => {
      newSocket.close();
    };
  }, [announceToScreenReader]);

  // Fetch vehicles
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`);
      const data = await response.json();
      setVehicles(data.vehicles || data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    if (vehicles.length === 0) return [];
    
    return vehicles.filter(vehicle => {
      const matchesSearch = !searchQuery || 
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.trim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !filters.type || vehicle.type === filters.type;
      const matchesDrivetrain = !filters.drivetrain || vehicle.drivetrain === filters.drivetrain;
      const matchesFuelType = !filters.fuelType || vehicle.fuelType === filters.fuelType;
      const matchesMinPrice = !filters.minPrice || vehicle.msrp >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || vehicle.msrp <= parseInt(filters.maxPrice);
      const matchesMinMpg = !filters.minMpg || vehicle.mpg.combined >= parseInt(filters.minMpg);

      return matchesSearch && matchesType && matchesDrivetrain && matchesFuelType && 
             matchesMinPrice && matchesMaxPrice && matchesMinMpg;
    });
  }, [vehicles, searchQuery, filters]);

  // Handle chat with NLU
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { from: 'user' as const, text: chatInput };
    const userInput = chatInput;
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    announceToScreenReader('Processing your request...');

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: chatHistory,
          voiceInput: false,
        }),
      });

      const data: ChatResponse = await response.json();
      setChatHistory(prev => [...prev, { from: 'bot', text: data.response }]);
      announceToScreenReader(data.response);
      
      if (data.vehicles && data.vehicles.length > 0) {
        setChatVehicles(data.vehicles);
        announceToScreenReader(`Found ${data.vehicles.length} matching vehicles`);
      } else {
        setChatVehicles([]);
      }

      // Handle comparison
      if (data.action === 'compare' && data.structuredData?.type === 'comparison') {
        // Fetch full comparison
        const compareResponse = await fetch(`${API_BASE}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userInput,
          }),
        });
        const comparison: ComparisonResult = await compareResponse.json();
        setComparisonResult(comparison);
        setActiveTab('compare');
        announceToScreenReader('Comparison ready');
      }
    } catch (error) {
      console.error('Error chatting:', error);
      setChatHistory(prev => [...prev, { 
        from: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
      announceToScreenReader('Error processing request');
    } finally {
      setChatLoading(false);
    }
  };

  // Handle quick actions
  useEffect(() => {
    const handleQuickAction = (e: CustomEvent) => {
      const { action } = e.detail;
      setChatInput(action);
      setActiveTab('browse');
      // Trigger search
      setTimeout(() => {
        handleChatSend();
      }, 100);
    };

    window.addEventListener('quick-action', handleQuickAction as EventListener);
    return () => window.removeEventListener('quick-action', handleQuickAction as EventListener);
  }, []);

  // Handle voice input
  useEffect(() => {
    const handleVoiceInput = (e: CustomEvent) => {
      const { transcript } = e.detail;
      setChatInput(transcript);
      announceToScreenReader(`Voice input: ${transcript}`);
    };

    window.addEventListener('voice-input', handleVoiceInput as EventListener);
    return () => window.removeEventListener('voice-input', handleVoiceInput as EventListener);
  }, []);

  const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id));

  const buttonSize = settings.mode === 'senior' ? 'px-6 py-4 text-lg' : 'px-4 py-2 text-base';
  const textSize = settings.mode === 'senior' ? 'text-lg' : 'text-base';

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        fontSize: settings.largeText ? '18px' : '16px',
      }}
      data-accessibility-mode={settings.mode}
      data-reduced-motion={settings.reducedMotion}
      data-high-contrast={settings.highContrast}
    >
      {/* Hero Section */}
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
                onClick={() => {
                  setActiveTab('browse');
                  announceToScreenReader('Browsing vehicles');
                }}
                className={buttonSize + ' rounded-lg transition-all'}
                style={{
                  backgroundColor: activeTab === 'browse' ? 'var(--toyota-red)' : 'transparent',
                  color: activeTab === 'browse' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                }}
                aria-current={activeTab === 'browse' ? 'page' : undefined}
              >
                Browse
              </button>
              <button
                onClick={() => {
                  setActiveTab('compare');
                  setShowComparisonChat(true);
                  announceToScreenReader('Compare vehicles');
                }}
                className={buttonSize + ' rounded-lg transition-all'}
                style={{
                  backgroundColor: activeTab === 'compare' ? 'var(--toyota-red)' : 'transparent',
                  color: activeTab === 'compare' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                }}
                aria-current={activeTab === 'compare' ? 'page' : undefined}
              >
                Compare {selectedVehicles.length > 0 && `(${selectedVehicles.length})`}
              </button>
              <button
                onClick={() => {
                  setActiveTab('finance');
                  announceToScreenReader('Finance calculator');
                }}
                className={buttonSize + ' rounded-lg transition-all'}
                style={{
                  backgroundColor: activeTab === 'finance' ? 'var(--toyota-red)' : 'transparent',
                  color: activeTab === 'finance' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                }}
                aria-current={activeTab === 'finance' ? 'page' : undefined}
              >
                Finance
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8" role="main">
        {/* Accessibility Controls */}
        <AccessibilityControls />

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24" style={{ backgroundColor: 'var(--card-bg-light)' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Filters</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Search</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search vehicles..."
                      className="input-glass w-full"
                      aria-label="Search vehicles"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Vehicle Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="input-glass w-full"
                    >
                      <option value="">All Types</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setFilters({ type: '', drivetrain: '', fuelType: '', minPrice: '', maxPrice: '', minMpg: '' });
                      setSearchQuery('');
                    }}
                    className="btn-toyota-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </aside>
            <div className="lg:col-span-3">
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Explore Vehicles</h1>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--toyota-red)' }}></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      className={`glass-card glass-card-hover p-6 animate-fade-in ${
                        selectedVehicles.includes(vehicle.id) ? 'ring-2' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        borderColor: selectedVehicles.includes(vehicle.id) ? 'var(--toyota-red)' : 'var(--glass-border)',
                        backgroundColor: 'var(--card-bg-light)',
                      }}
                    >
                      <div className="relative mb-4 rounded-xl overflow-hidden h-48">
                        <img
                          src={vehicle.colors?.[0]?.imageUrl || 'https://via.placeholder.com/400x300'}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        ${vehicle.msrp.toLocaleString()} • {vehicle.mpg.combined} MPG
                      </p>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedVehicles(prev => 
                              prev.includes(vehicle.id) ? prev.filter(x => x !== vehicle.id) : prev.length < 3 ? [...prev, vehicle.id] : prev
                            );
                          }}
                          className="w-full py-2 rounded-lg"
                          style={{
                            backgroundColor: selectedVehicles.includes(vehicle.id) ? 'var(--toyota-red)' : 'transparent',
                            color: selectedVehicles.includes(vehicle.id) ? 'white' : 'var(--toyota-red)',
                            border: '2px solid var(--toyota-red)',
                          }}
                        >
                          {selectedVehicles.includes(vehicle.id) ? '✓ Selected' : 'Select to Compare'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicleForFinance(vehicle);
                            setActiveTab('finance');
                          }}
                          className="w-full py-2 rounded-lg border"
                          style={{ borderColor: 'var(--toyota-red)', color: 'var(--toyota-red)' }}
                        >
                          Finance Options
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <>
            {showComparisonChat ? (
              <ComparisonChat
                onComparisonComplete={(comparison) => {
                  setComparisonResult(comparison);
                  setShowComparisonChat(false);
                }}
                onClose={() => setShowComparisonChat(false)}
              />
            ) : comparisonResult ? (
              <ComparisonSplitScreen
                comparison={comparisonResult}
                onClose={() => setComparisonResult(null)}
              />
            ) : (
              <div className="glass-card p-12 text-center">
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Compare Vehicles</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Select up to 3 vehicles to compare side-by-side.</p>
                {selectedVehiclesData.length > 0 && (
                  <div className="mt-8">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="p-4" style={{ color: 'var(--text-primary)' }}>Specification</th>
                          {selectedVehiclesData.map(v => (
                            <th key={v.id} className="p-4" style={{ color: 'var(--text-primary)' }}>
                              {v.make} {v.model}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-4" style={{ color: 'var(--text-secondary)' }}>Price</td>
                          {selectedVehiclesData.map(v => (
                            <td key={v.id} className="p-4" style={{ color: 'var(--text-primary)' }}>
                              ${v.msrp.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4" style={{ color: 'var(--text-secondary)' }}>MPG</td>
                          {selectedVehiclesData.map(v => (
                            <td key={v.id} className="p-4" style={{ color: 'var(--text-primary)' }}>
                              {v.mpg.combined}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <FinancePage
            vehicles={vehicles}
            selectedVehicle={selectedVehicleForFinance || (selectedVehiclesData.length > 0 ? selectedVehiclesData[0] : null)}
          />
        )}
      </main>

      {/* AI Chatbot */}
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
        settings={settings}
      />

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>© 2025 Toyota AI Shopping Experience. Built with innovation and precision.</p>
        </div>
      </footer>
    </div>
  );
}

// Wrapper with Accessibility Provider
export default function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}

// AI Chatbot Component
interface AIChatbotProps {
  chatHistory: Array<{ from: 'user' | 'bot'; text: string }>;
  chatInput: string;
  setChatInput: (input: string) => void;
  onSend: () => void;
  loading: boolean;
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  settings: AccessibilitySettings;
}

function AIChatbot({ chatHistory, chatInput, setChatInput, onSend, loading, vehicles, onVehicleSelect, settings }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, vehicles]);

  const buttonSize = settings.mode === 'senior' ? 'px-6 py-4 text-lg' : 'px-4 py-2 text-base';

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-white text-2xl z-50"
          style={{
            backgroundColor: 'var(--toyota-red)',
            minWidth: settings.mode === 'senior' ? '72px' : '64px',
            minHeight: settings.mode === 'senior' ? '72px' : '64px',
          }}
          aria-label="Open AI chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-96 h-[700px] glass-card border shadow-2xl z-50 flex flex-col animate-scale-in"
          style={{
            backgroundColor: 'var(--card-bg-light)',
            borderColor: 'var(--glass-border)',
          }}
          role="dialog"
          aria-label="AI chat"
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close chat"
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
                      ? 'text-white'
                      : 'text-gray-100'
                  }`}
                  style={{
                    backgroundColor: msg.from === 'user' ? 'var(--toyota-red)' : 'var(--glass-bg-dark)',
                  }}
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

            {vehicles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Matching Vehicles ({vehicles.length}):
                </div>
                {vehicles.slice(0, 3).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="glass-card glass-card-hover p-3 cursor-pointer"
                    onClick={() => {
                      onVehicleSelect(vehicle);
                      setIsOpen(false);
                    }}
                    style={{ backgroundColor: 'var(--glass-bg-dark)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          ${vehicle.msrp.toLocaleString()} • {vehicle.mpg.combined} MPG
                        </div>
                      </div>
                      <button className="text-xs font-semibold hover:underline" style={{ color: 'var(--toyota-red)' }}>
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSend()}
                placeholder="Ask me anything..."
                className="input-glass flex-1"
                disabled={loading}
                aria-label="Chat input"
              />
              <button
                onClick={onSend}
                disabled={loading}
                className={buttonSize + ' rounded-lg text-white font-semibold'}
                style={{
                  backgroundColor: 'var(--toyota-red)',
                  minHeight: settings.mode === 'senior' ? '56px' : 'auto',
                }}
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

