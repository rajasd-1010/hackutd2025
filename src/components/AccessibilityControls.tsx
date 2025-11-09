/**
 * Accessibility Controls Panel
 * Large tappable controls for Kid/Senior modes, voice, etc.
 */

import React from 'react';
import { useAccessibility } from './AccessibilityProvider';

export function AccessibilityControls() {
  const { settings, updateSettings, announceToScreenReader, isVoiceEnabled } = useAccessibility();

  const handleModeChange = (mode: 'standard' | 'kid' | 'senior') => {
    updateSettings({ mode });
    announceToScreenReader(`Switched to ${mode} mode`);
  };

  const handleVoiceToggle = () => {
    const newValue = !settings.voiceEnabled;
    updateSettings({ voiceEnabled: newValue });
    announceToScreenReader(newValue ? 'Voice controls enabled' : 'Voice controls disabled');
    
    if (newValue) {
      window.dispatchEvent(new CustomEvent('voice-start'));
    }
  };

  const buttonSize = settings.mode === 'kid' || settings.mode === 'senior' 
    ? 'px-8 py-6 text-xl' 
    : 'px-6 py-4 text-base';

  return (
    <div 
      className="glass-card p-6 mb-6"
      role="region"
      aria-label="Accessibility controls"
    >
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Accessibility Options
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Interface Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('standard')}
              className={`${buttonSize} rounded-lg transition-all ${
                settings.mode === 'standard'
                  ? 'bg-toyota-red text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
              aria-pressed={settings.mode === 'standard'}
              style={{
                minHeight: settings.mode === 'senior' ? '60px' : 'auto',
              }}
            >
              Standard
            </button>
            <button
              onClick={() => handleModeChange('kid')}
              className={`${buttonSize} rounded-lg transition-all ${
                settings.mode === 'kid'
                  ? 'bg-toyota-red text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
              aria-pressed={settings.mode === 'kid'}
              style={{
                minHeight: settings.mode === 'senior' ? '60px' : 'auto',
              }}
            >
              Kid Mode
            </button>
            <button
              onClick={() => handleModeChange('senior')}
              className={`${buttonSize} rounded-lg transition-all ${
                settings.mode === 'senior'
                  ? 'bg-toyota-red text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
              aria-pressed={settings.mode === 'senior'}
              style={{
                minHeight: settings.mode === 'senior' ? '60px' : 'auto',
              }}
            >
              Senior Mode
            </button>
          </div>
        </div>

        {/* Voice Control */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Voice Controls
          </label>
          <button
            onClick={handleVoiceToggle}
            className={`${buttonSize} w-full rounded-lg transition-all ${
              isVoiceEnabled
                ? 'bg-toyota-red text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            aria-pressed={isVoiceEnabled}
            style={{
              minHeight: settings.mode === 'senior' ? '60px' : 'auto',
            }}
          >
            {isVoiceEnabled ? '🎤 Voice On' : '🎤 Voice Off'}
          </button>
        </div>

        {/* High Contrast */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Display Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => {
                  updateSettings({ highContrast: e.target.checked });
                  announceToScreenReader(`High contrast ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-6 h-6"
                style={{
                  minWidth: settings.mode === 'senior' ? '24px' : 'auto',
                  minHeight: settings.mode === 'senior' ? '24px' : 'auto',
                }}
              />
              <span style={{ 
                fontSize: settings.mode === 'senior' ? '18px' : '16px',
                color: 'var(--text-primary)',
              }}>
                High Contrast
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={(e) => {
                  updateSettings({ largeText: e.target.checked });
                  announceToScreenReader(`Large text ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-6 h-6"
                style={{
                  minWidth: settings.mode === 'senior' ? '24px' : 'auto',
                  minHeight: settings.mode === 'senior' ? '24px' : 'auto',
                }}
              />
              <span style={{ 
                fontSize: settings.mode === 'senior' ? '18px' : '16px',
                color: 'var(--text-primary)',
              }}>
                Large Text
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboardOnly}
                onChange={(e) => {
                  updateSettings({ keyboardOnly: e.target.checked });
                  announceToScreenReader(`Keyboard-only mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-6 h-6"
                style={{
                  minWidth: settings.mode === 'senior' ? '24px' : 'auto',
                  minHeight: settings.mode === 'senior' ? '24px' : 'auto',
                }}
              />
              <span style={{ 
                fontSize: settings.mode === 'senior' ? '18px' : '16px',
                color: 'var(--text-primary)',
              }}>
                Keyboard Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Action Chips for Kid/Senior Mode */}
      {(settings.mode === 'kid' || settings.mode === 'senior') && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              'Show me offroad Toyotas',
              'Find hybrid cars',
              'Affordable SUVs',
              'Compare vehicles',
            ].map((action) => (
              <button
                key={action}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('quick-action', { detail: { action } }));
                  announceToScreenReader(`Selected: ${action}`);
                }}
                className="px-6 py-4 rounded-full glass-card hover:bg-white/10 transition-all text-lg font-medium"
                style={{
                  minHeight: '56px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--glass-bg-dark)',
                  border: '2px solid var(--toyota-red)',
                }}
                aria-label={action}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessibilityControls;

