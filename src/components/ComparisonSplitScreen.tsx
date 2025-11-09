/**
 * Split-Screen Comparison Component
 * Shows two vehicles side-by-side with exact color/image mapping
 * White/glass cards with Toyota-red micro accents
 */

import React from 'react';
import type { ComparisonResult, VehicleColor } from '../types';

interface ComparisonSplitScreenProps {
  comparison: ComparisonResult;
  onClose?: () => void;
}

export function ComparisonSplitScreen({ comparison, onClose }: ComparisonSplitScreenProps) {
  const { vehicle1, vehicle2, differences, similarities, financing } = comparison;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      role="dialog"
      aria-labelledby="comparison-title"
      aria-modal="true"
    >
      <div 
        className="glass-card p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          backgroundColor: 'var(--card-bg-light)',
          borderRadius: '16px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            id="comparison-title"
            className="text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Vehicle Comparison
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              aria-label="Close comparison"
              style={{ color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Split Screen Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle 1 */}
          <VehicleComparisonCard
            vehicle={vehicle1}
            selectedColor={vehicle1.selectedColor}
            imageUrl={vehicle1.imageUrl}
            financing={financing.vehicle1}
            accentSide="left"
          />

          {/* Vehicle 2 */}
          <VehicleComparisonCard
            vehicle={vehicle2}
            selectedColor={vehicle2.selectedColor}
            imageUrl={vehicle2.imageUrl}
            financing={financing.vehicle2}
            accentSide="right"
          />
        </div>

        {/* Differences & Similarities */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Key Differences
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Price Difference</span>
                  <span 
                    className="font-bold"
                    style={{ 
                      color: differences.price > 0 ? 'var(--toyota-red)' : '#10b981',
                    }}
                  >
                    ${Math.abs(differences.price).toLocaleString()}
                    {differences.price > 0 ? ' more' : ' less'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>MPG Difference</span>
                  <span 
                    className="font-bold"
                    style={{ 
                      color: differences.mpg > 0 ? '#10b981' : 'var(--toyota-red)',
                    }}
                  >
                    {differences.mpg > 0 ? '+' : ''}{differences.mpg} MPG
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Horsepower Difference</span>
                  <span 
                    className="font-bold"
                    style={{ 
                      color: differences.horsepower > 0 ? '#10b981' : 'var(--toyota-red)',
                    }}
                  >
                    {differences.horsepower > 0 ? '+' : ''}{differences.horsepower} HP
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Similarities
              </h3>
              <div className="flex flex-wrap gap-2">
                {similarities.map((similarity, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{
                      backgroundColor: 'var(--glass-bg-dark)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--luxury-gold)',
                    }}
                  >
                    {similarity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VehicleComparisonCardProps {
  vehicle: ComparisonResult['vehicle1'];
  selectedColor: VehicleColor;
  imageUrl: string;
  financing: ComparisonResult['financing']['vehicle1'];
  accentSide: 'left' | 'right';
}

function VehicleComparisonCard({ 
  vehicle, 
  selectedColor, 
  imageUrl, 
  financing,
  accentSide 
}: VehicleComparisonCardProps) {
  return (
    <div
      className="glass-card p-6 relative"
      style={{
        backgroundColor: 'var(--card-bg-light)',
        borderRadius: '12px',
        borderLeft: accentSide === 'left' ? '4px solid var(--toyota-red)' : 'none',
        borderRight: accentSide === 'right' ? '4px solid var(--toyota-red)' : 'none',
      }}
    >
      {/* Vehicle Image */}
      <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 h-64">
        <img
          src={imageUrl}
          alt={`${vehicle.make} ${vehicle.model} in ${selectedColor.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x600/1a1a1a/EB0A1E?text=${encodeURIComponent(vehicle.model)}`;
          }}
        />
        <div 
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--toyota-red)', color: 'white' }}
        >
          {selectedColor.name}
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
          {vehicle.trim} • {vehicle.year}
        </p>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <div className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>MSRP</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ${vehicle.msrp.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <div className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Dealer Price</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--toyota-red)' }}>
              ${vehicle.dealerPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>MPG</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {vehicle.mpg.combined}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Drivetrain</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {vehicle.drivetrain}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>HP</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {vehicle.engine.horsepower}
            </div>
          </div>
        </div>
      </div>

      {/* Financing Breakdown */}
      <div className="pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Financing Options
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Buy (60mo)</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${financing.buy.monthly.toLocaleString()}/mo
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Lease (36mo)</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${financing.lease.monthly.toLocaleString()}/mo
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--glass-bg-dark)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subscribe (36mo)</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${financing.subscription.monthly.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComparisonSplitScreen;

