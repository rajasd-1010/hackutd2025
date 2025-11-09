import React from 'react';
import type { Vehicle, AccessibilitySettings } from '../types';

interface BrowseViewProps {
  vehicles: Vehicle[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  selectedVehicles: string[];
  onSelectVehicle: (id: string) => void;
  onFinanceClick: (vehicle: Vehicle) => void;
  settings: AccessibilitySettings;
}

export function BrowseView({
  vehicles,
  loading,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  selectedVehicles,
  onSelectVehicle,
  onFinanceClick,
  settings,
}: BrowseViewProps) {
  const inputSize = settings.mode === 'senior' ? 'px-4 py-4 text-lg' : 'px-4 py-3 text-base';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters */}
      <aside className="lg:col-span-1">
        <div className="glass-card p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Filters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles..."
                className={`input-glass w-full ${inputSize}`}
                aria-label="Search vehicles"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Vehicle Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className={`input-glass w-full ${inputSize}`}
                aria-label="Filter by vehicle type"
              >
                <option value="">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="Min"
                  className={`input-glass w-full ${inputSize}`}
                  aria-label="Minimum price"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Max"
                  className={`input-glass w-full ${inputSize}`}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setFilters({ type: '', drivetrain: '', fuelType: '', minPrice: '', maxPrice: '', minMpg: '' });
                setSearchQuery('');
              }}
              className="btn-toyota-outline w-full"
              style={{ minHeight: settings.mode === 'senior' ? '56px' : 'auto' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </aside>

      {/* Vehicle Grid */}
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Explore Toyota Vehicles
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--toyota-red)' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                isSelected={selectedVehicles.includes(vehicle.id)}
                onSelect={() => onSelectVehicle(vehicle.id)}
                onFinanceClick={() => onFinanceClick(vehicle)}
                settings={settings}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, index, isSelected, onSelect, onFinanceClick, settings }: any) {
  const buttonSize = settings.mode === 'senior' ? 'px-6 py-4 text-lg' : 'px-4 py-2 text-base';
  
  return (
    <div
      className={`glass-card glass-card-hover p-6 animate-fade-in ${
        isSelected ? 'ring-2' : ''
      }`}
      style={{
        animationDelay: `${index * 0.1}s`,
        borderColor: isSelected ? 'var(--toyota-red)' : 'var(--glass-border)',
        backgroundColor: 'var(--card-bg-light)',
      }}
    >
      <div className="relative mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 h-48">
        <img
          src={vehicle.colors?.[0]?.imageUrl || 'https://via.placeholder.com/400x300'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/1a1a1a/EB0A1E?text=${encodeURIComponent(vehicle.model)}`;
          }}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          {vehicle.trim} • {vehicle.year} • {vehicle.type}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            ${vehicle.msrp.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {vehicle.mpg.combined} MPG
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {vehicle.drivetrain}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onSelect}
          className={`w-full ${buttonSize} rounded-lg font-semibold transition-all`}
          style={{
            backgroundColor: isSelected ? 'var(--toyota-red)' : 'transparent',
            color: isSelected ? 'white' : 'var(--toyota-red)',
            border: `2px solid var(--toyota-red)`,
            minHeight: settings.mode === 'senior' ? '56px' : 'auto',
          }}
          aria-pressed={isSelected}
        >
          {isSelected ? '✓ Selected' : 'Select to Compare'}
        </button>
        <button
          onClick={onFinanceClick}
          className={`w-full ${buttonSize} rounded-lg border transition-all`}
          style={{
            borderColor: 'var(--toyota-red)',
            color: 'var(--toyota-red)',
            minHeight: settings.mode === 'senior' ? '56px' : 'auto',
          }}
        >
          Finance Options
        </button>
      </div>
    </div>
  );
}

