import React, { useState, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

export function ComparisonChat({ onComparisonComplete, onClose }) {
  const [chatHistory, setChatHistory] = useState([
    { from: 'bot', text: "I can help you compare any two vehicles! Try saying something like 'Compare Toyota Camry with Honda Accord' or 'Show me Toyota RAV4 vs Mazda CX-5'. What would you like to compare?" },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, comparisonResult]);

  const handleSend = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = { from: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    const query = chatInput;
    setChatInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.error) {
        setChatHistory(prev => [...prev, {
          from: 'bot',
          text: data.error + (data.suggestions ? `\n\nAvailable vehicles: ${data.suggestions.map(s => s.name).join(', ')}` : ''),
        }]);
      } else {
        setComparisonResult(data);
        setChatHistory(prev => [...prev, {
          from: 'bot',
          text: `I found both vehicles! Here's a comparison between the ${data.vehicle1.make} ${data.vehicle1.model} and ${data.vehicle2.make} ${data.vehicle2.model}.`,
        }]);
        if (onComparisonComplete) {
          onComparisonComplete(data);
        }
      }
    } catch (error) {
      console.error('Error comparing vehicles:', error);
      setChatHistory(prev => [...prev, {
        from: 'bot',
        text: 'Sorry, I encountered an error. Please try again with vehicle names like "Toyota Camry vs Honda Accord".',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gradient">Smart Vehicle Comparison</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="mb-4 h-96 overflow-y-auto custom-scrollbar space-y-4">
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
        <div ref={chatEndRef} />
      </div>

      {comparisonResult && (
        <div className="mb-4 glass-card p-6 animate-slide-up">
          <h3 className="text-xl font-bold mb-4 text-gradient">Comparison Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VehicleComparisonCard vehicle={comparisonResult.vehicle1} />
            <VehicleComparisonCard vehicle={comparisonResult.vehicle2} />
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-semibold mb-3 text-gray-300">Key Differences</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Price Difference</span>
                <span className={`font-semibold ${comparisonResult.differences.price > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${Math.abs(comparisonResult.differences.price).toLocaleString()}
                  {comparisonResult.differences.price > 0 ? ' more' : ' less'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MPG Difference</span>
                <span className={`font-semibold ${comparisonResult.differences.mpg > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparisonResult.differences.mpg > 0 ? '+' : ''}{comparisonResult.differences.mpg} MPG
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Horsepower Difference</span>
                <span className={`font-semibold ${comparisonResult.differences.horsepower > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparisonResult.differences.horsepower > 0 ? '+' : ''}{comparisonResult.differences.horsepower} HP
                </span>
              </div>
            </div>

            {comparisonResult.similarities.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-gray-300">Similarities</h4>
                <div className="flex flex-wrap gap-2">
                  {comparisonResult.similarities.map((similarity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                    >
                      {similarity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Compare vehicles (e.g., 'Toyota Camry vs Honda Accord')"
          className="input-glass flex-1"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-toyota"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function VehicleComparisonCard({ vehicle }) {
  return (
    <div className="glass-card glass-card-hover p-4">
      <h4 className="font-bold text-lg mb-2">{vehicle.make} {vehicle.model}</h4>
      <div className="text-sm text-gray-400 mb-3">{vehicle.year} • {vehicle.type}</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Price</span>
          <span className="text-white font-semibold">${vehicle.price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">MPG</span>
          <span className="text-white">{vehicle.mpg}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Engine</span>
          <span className="text-white text-xs">{vehicle.engine}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Horsepower</span>
          <span className="text-white">{vehicle.horsepower} HP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Drivetrain</span>
          <span className="text-white">{vehicle.drivetrain}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Fuel Type</span>
          <span className="text-white">{vehicle.fuelType}</span>
        </div>
      </div>
    </div>
  );
}

export default ComparisonChat;

