/**
 * Frontend TypeScript types
 * Re-exported from shared types for convenience
 */

export type {
  Vehicle,
  VehicleColor,
  VehiclesResponse,
  CompareRequest,
  ComparisonResult,
  ChatRequest,
  ChatResponse,
  ChatMessage,
  FinancingParams,
  PaymentCalculation,
  FinancingBreakdown,
  AccessibilitySettings,
  RealtimeUpdate,
} from '../../../shared/types';

export interface AppState {
  vehicles: Vehicle[];
  selectedVehicles: string[];
  activeTab: 'browse' | 'compare' | 'finance' | 'dealers';
  theme: 'light' | 'dark';
  accessibility: AccessibilitySettings;
}

