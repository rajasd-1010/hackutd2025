/**
 * Finance Page Component (TypeScript)
 * Wired to live state with sliders/dropdowns for instant recalculation
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Vehicle, PaymentCalculation, FinancingParams } from '../types';
import { useAccessibility } from './AccessibilityProvider';

const API_BASE = 'http://localhost:3001/api';

interface FinancePageProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
}

interface Scenario {
  type: 'purchase' | 'lease' | 'subscription';
  label: string;
  price: number;
  downPayment: number;
  apr: number;
  termMonths: number;
  residualValue?: number | null;
  tradeInValue: number;
  taxRate: number;
}

export function FinancePage({ vehicles, selectedVehicle }: FinancePageProps) {
  const { settings } = useAccessibility();
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      type: 'purchase',
      label: 'Buy',
      price: selectedVehicle?.msrp || 30000,
      downPayment: 2000,
      apr: 5.5,
      termMonths: 60,
      tradeInValue: 0,
      taxRate: 8,
    },
    {
      type: 'lease',
      label: 'Lease',
      price: selectedVehicle?.msrp || 30000,
      downPayment: 2000,
      apr: 3.9,
      termMonths: 36,
      residualValue: null,
      tradeInValue: 0,
      taxRate: 8,
    },
    {
      type: 'subscription',
      label: 'Subscribe',
      price: selectedVehicle?.msrp || 30000,
      downPayment: 500,
      apr: 0,
      termMonths: 36,
      tradeInValue: 0,
      taxRate: 8,
    },
  ]);

  const [results, setResults] = useState<Record<string, PaymentCalculation>>({});

  const calculatePayment = useCallback(async (scenario: Scenario) => {
    try {
      const params: FinancingParams = {
        price: scenario.price,
        downPayment: scenario.downPayment,
        apr: scenario.apr,
        termMonths: scenario.termMonths,
        isLease: scenario.type === 'lease',
        isSubscription: scenario.type === 'subscription',
        residualValue: scenario.residualValue || undefined,
        tradeInValue: scenario.tradeInValue,
        taxRate: scenario.taxRate / 100,
      };

      const response = await fetch(`${API_BASE}/calculate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Calculation failed');
      }

      const data: PaymentCalculation = await response.json();
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
        price: selectedVehicle.msrp,
      })));
    }
  }, [selectedVehicle]);

  useEffect(() => {
    scenarios.forEach(scenario => {
      calculatePayment(scenario);
    });
  }, [scenarios, calculatePayment]);

  const updateScenario = (type: string, field: keyof Scenario, value: number | string | null) => {
    setScenarios(prev => prev.map(s => {
      if (s.type === type) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const inputSize = settings.mode === 'senior' ? 'px-4 py-4 text-lg' : 'px-4 py-3 text-base';
  const buttonSize = settings.mode === 'senior' ? 'px-8 py-6 text-xl' : 'px-6 py-4 text-lg';

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Finance Options
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Compare buying, leasing, and subscription options for{' '}
          {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'your vehicle'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.type}
              scenario={scenario}
              result={results[scenario.type]}
              onUpdate={(field, value) => updateScenario(scenario.type, field, value)}
              index={index}
              inputSize={inputSize}
              buttonSize={buttonSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ScenarioCardProps {
  scenario: Scenario;
  result?: PaymentCalculation;
  onUpdate: (field: keyof Scenario, value: number | string | null) => void;
  index: number;
  inputSize: string;
  buttonSize: string;
}

function ScenarioCard({ scenario, result, onUpdate, index, inputSize, buttonSize }: ScenarioCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div 
      className="glass-card glass-card-hover p-6 animate-fade-in"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        backgroundColor: 'var(--card-bg-light)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {scenario.label}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {result && (
        <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
          <div className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Monthly Payment</div>
          <div className="text-3xl font-bold" style={{ color: 'var(--toyota-red)' }}>
            ${result.monthlyPayment?.toLocaleString()}
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            {scenario.termMonths} months • ${scenario.downPayment.toLocaleString()} down
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 animate-slide-up">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Vehicle Price
            </label>
            <input
              type="number"
              value={scenario.price}
              onChange={(e) => onUpdate('price', parseInt(e.target.value) || 0)}
              className={`input-glass w-full ${inputSize}`}
              aria-label="Vehicle price"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Down Payment
            </label>
            <input
              type="number"
              value={scenario.downPayment}
              onChange={(e) => onUpdate('downPayment', parseInt(e.target.value) || 0)}
              className={`input-glass w-full ${inputSize}`}
              aria-label="Down payment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Trade-in Value
            </label>
            <input
              type="number"
              value={scenario.tradeInValue}
              onChange={(e) => onUpdate('tradeInValue', parseInt(e.target.value) || 0)}
              className={`input-glass w-full ${inputSize}`}
              placeholder="0"
              aria-label="Trade-in value"
            />
          </div>

          {scenario.type !== 'subscription' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                APR (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={scenario.apr}
                onChange={(e) => onUpdate('apr', parseFloat(e.target.value) || 0)}
                className={`input-glass w-full ${inputSize}`}
                aria-label="APR percentage"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
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
              aria-label={`Term length: ${scenario.termMonths} months`}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              <span>{scenario.type === 'lease' ? '24' : '36'}</span>
              <span>{scenario.type === 'lease' ? '48' : '84'}</span>
            </div>
          </div>

          {scenario.type === 'lease' && result?.residualValue && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Residual Value</div>
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                ${result.residualValue.toLocaleString()}
              </div>
            </div>
          )}

          {result && (
            <div className="pt-4 border-t space-y-2 text-sm" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Total Cost</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  ${result.totalCost?.toLocaleString()}
                </span>
              </div>
              {result.totalInterest && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Interest</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    ${result.totalInterest.toLocaleString()}
                  </span>
                </div>
              )}
              {result.breakdown && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Breakdown:</div>
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-tertiary)' }} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>
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

