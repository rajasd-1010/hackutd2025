/**
 * Accessibility Provider
 * Manages Kid/Senior modes, voice controls, keyboard-only, etc.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AccessibilitySettings } from '../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  isKidMode: boolean;
  isSeniorMode: boolean;
  isVoiceEnabled: boolean;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to defaults
      }
    }
    
    // Default settings
    return {
      mode: 'standard',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: false,
      largeText: false,
      voiceEnabled: false,
      keyboardOnly: false,
    };
  });

  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply settings to document
    document.documentElement.setAttribute('data-accessibility-mode', settings.mode);
    document.documentElement.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');
    document.documentElement.setAttribute('data-high-contrast', settings.highContrast ? 'true' : 'false');
    document.documentElement.setAttribute('data-large-text', settings.largeText ? 'true' : 'false');
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(m => m !== message));
    }, 1000);
  }, []);

  // Voice recognition setup
  useEffect(() => {
    if (!settings.voiceEnabled) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      announceToScreenReader(`Voice input: ${transcript}`);
      // Emit custom event for voice input
      window.dispatchEvent(new CustomEvent('voice-input', { detail: { transcript } }));
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    // Start listening on voice button press
    const handleVoiceStart = () => {
      try {
        recognition.start();
        announceToScreenReader('Listening...');
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    };

    window.addEventListener('voice-start', handleVoiceStart);

    return () => {
      window.removeEventListener('voice-start', handleVoiceStart);
      recognition.stop();
    };
  }, [settings.voiceEnabled, announceToScreenReader]);

  // Keyboard-only navigation
  useEffect(() => {
    if (!settings.keyboardOnly) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Allow mouse for clicking, but show keyboard focus
      (e.target as HTMLElement)?.focus();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [settings.keyboardOnly]);

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    isKidMode: settings.mode === 'kid',
    isSeniorMode: settings.mode === 'senior',
    isVoiceEnabled: settings.voiceEnabled,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.map((msg, i) => (
          <span key={i}>{msg}</span>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

