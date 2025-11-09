import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

export function FinancePage({ vehicles, selectedVehicle }) {
  const [scenarios, setScenarios] = useState([
    {
      type: 'purchase',
      label: 'Buy',
      price: selectedVehicle?.price || 30000,
      downPayment: 2000,
      apr: 5.5,
      termMonths: 60,
      tradeInValue: 0,
      taxRate: 8,
    },
    {
      type: 'lease',
      label: 'Lease',
      price: selectedVehicle?.price || 30000,
      downPayment: 2000,
      apr: 3.9,
      termMonths: 36,
      residualValue: null, // Will be calculated
      tradeInValue: 0,
      taxRate: 8,
    },
    {
      type: 'subscription',
      label: 'Subscribe',
      price: selectedVehicle?.price || 30000,
      downPayment: 500,
      apr: 0,
      termMonths: 36,
      tradeInValue: 0,
      taxRate: 8,
    },
  ]);

  const [results, setResults] = useState({});

  const calculatePayment = useCallback(async (scenario) => {
    try {
      const response = await fetch(`${API_BASE}/calculate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: scenario.price,
          downPayment: scenario.downPayment,
          apr: scenario.apr,
          termMonths: scenario.termMonths,
          isLease: scenario.type === 'lease',
          isSubscription: scenario.type === 'subscription',
          residualValue: scenario.residualValue,
          tradeInValue: scenario.tradeInValue,
          taxRate: scenario.taxRate / 100,
        }),
      });

      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [scenario.type]: data,
      }));
    } catch (error) {
      console.error('Error calculating payment:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      setScenarios(prev => prev.map(s => ({
        ...s,
        price: selectedVehicle.price,
      })));
    }
  }, [selectedVehicle]);

  useEffect(() => {
    scenarios.forEach(scenario => {
      calculatePayment(scenario);
    });
  }, [scenarios, calculatePayment]);

  const updateScenario = (type, field, value) => {
    setScenarios(prev => prev.map(s => {
      if (s.type === type) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold mb-2 text-gradient">Finance Options</h2>
        <p className="text-gray-400 mb-6">
          Compare buying, leasing, and subscription options for {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'your vehicle'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.type}
              scenario={scenario}
              result={results[scenario.type]}
              onUpdate={(field, value) => updateScenario(scenario.type, field, value)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, result, onUpdate, index }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div className="glass-card glass-card-hover p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gradient">{scenario.label}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {result && (
        <div className="mb-4 p-4 bg-white/5 rounded-xl">
          <div className="text-sm text-gray-400 mb-1">Monthly Payment</div>
          <div className="text-3xl font-bold text-toyota-red">
            ${result.monthlyPayment?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {scenario.termMonths} months • ${scenario.downPayment.toLocaleString()} down
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle Price
            </label>
            <input
              type="number"
              value={scenario.price}
              onChange={(e) => onUpdate('price', parseInt(e.target.value) || 0)}
              className="input-glass w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Down Payment
            </label>
            <input
              type="number"
              value={scenario.downPayment}
              onChange={(e) => onUpdate('downPayment', parseInt(e.target.value) || 0)}
              className="input-glass w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trade-in Value
            </label>
            <input
              type="number"
              value={scenario.tradeInValue}
              onChange={(e) => onUpdate('tradeInValue', parseInt(e.target.value) || 0)}
              className="input-glass w-full"
              placeholder="0"
            />
          </div>

          {scenario.type !== 'subscription' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                APR (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={scenario.apr}
                onChange={(e) => onUpdate('apr', parseFloat(e.target.value) || 0)}
                className="input-glass w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Term: {scenario.termMonths} months
            </label>
            <input
              type="range"
              min={scenario.type === 'lease' ? 24 : 36}
              max={scenario.type === 'lease' ? 48 : 84}
              step={scenario.type === 'lease' ? 6 : 12}
              value={scenario.termMonths}
              onChange={(e) => onUpdate('termMonths', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{scenario.type === 'lease' ? '24' : '36'}</span>
              <span>{scenario.type === 'lease' ? '48' : '84'}</span>
            </div>
          </div>

          {scenario.type === 'lease' && result?.residualValue && (
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Residual Value</div>
              <div className="text-lg font-semibold">
                ${result.residualValue.toLocaleString()}
              </div>
            </div>
          )}

          {result && (
            <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-white font-semibold">
                  ${result.totalCost?.toLocaleString()}
                </span>
              </div>
              {result.totalInterest && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Interest</span>
                  <span className="text-white">
                    ${result.totalInterest.toLocaleString()}
                  </span>
                </div>
              )}
              {result.breakdown && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Breakdown:</div>
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-gray-300">
                        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FinancePage;

