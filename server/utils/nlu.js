/**
 * Natural Language Understanding (NLU) System
 * Handles entity extraction, fuzzy matching, color mapping, and intent detection
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load vehicles data
let vehiclesData;
try {
  vehiclesData = JSON.parse(
    readFileSync(join(__dirname, '../data/vehicles.json'), 'utf-8')
  );
} catch (error) {
  // Fallback empty array if file doesn't exist
  vehiclesData = [];
}

// Color mapping with synonyms and variations
const COLOR_MAP = {
  'white': ['white', 'pearl', 'ice', 'snow', 'wht', 'wht', 'wind chill', 'platinum'],
  'black': ['black', 'midnight', 'jet', 'onyx', 'blk', 'obsidian'],
  'red': ['red', 'ruby', 'flare', 'supersonic', 'soul red', 'radiant', 'crimson', 'scarlet'],
  'blue': ['blue', 'blueprint', 'still night', 'navy', 'azure', 'cobalt'],
  'silver': ['silver', 'celestial', 'metallic', 'slv', 'chrome', 'platinum'],
  'gray': ['gray', 'grey', 'lunar', 'meteoroid', 'polymetal', 'charcoal', 'graphite'],
  'grey': ['gray', 'grey', 'lunar', 'meteoroid', 'polymetal', 'charcoal', 'graphite'],
};

// Model name variations and fuzzy matching
const MODEL_ALIASES = {
  'camry': ['camry', 'camery', 'camery'],
  'rav4': ['rav4', 'rav 4', 'rav-4', 'rav'],
  'corolla': ['corolla', 'corola', 'corala'],
  'accord': ['accord', 'acord'],
  'mazda3': ['mazda3', 'mazda 3', 'mazda-3', 'm3'],
  'prius': ['prius', 'prious'],
  'highlander': ['highlander', 'highland'],
  '4runner': ['4runner', '4 runner', 'four runner'],
  'tacoma': ['tacoma', 'tocoma'],
  'sequoia': ['sequoia', 'sequoya'],
};

// Make aliases
const MAKE_ALIASES = {
  'toyota': ['toyota', 'toy', 'toyo'],
  'honda': ['honda', 'hond'],
  'mazda': ['mazda', 'maz'],
  'ford': ['ford', 'frd'],
  'nissan': ['nissan', 'nisan'],
};

// Price keywords
const PRICE_KEYWORDS = {
  'affordable': { max: 30000 },
  'budget': { max: 25000 },
  'cheap': { max: 25000 },
  'economical': { max: 30000 },
  'luxury': { min: 50000 },
  'premium': { min: 40000 },
  'expensive': { min: 40000 },
  'high-end': { min: 50000 },
};

// Intent detection patterns
const INTENT_PATTERNS = {
  search: /(show|find|search|look for|display|list|get|see|want|need|looking for)/i,
  compare: /(compare|vs|versus|compared to|comparison|difference|different|versus|against)/i,
  filter: /(filter|only|just|with|has|have|need|must)/i,
  finance: /(finance|payment|lease|buy|purchase|monthly|afford|price|cost)/i,
};

/**
 * Extract color from natural language
 */
export function extractColor(text) {
  const lowerText = text.toLowerCase();
  
  for (const [color, variations] of Object.entries(COLOR_MAP)) {
    for (const variation of variations) {
      if (lowerText.includes(variation)) {
        // Try to find exact match in vehicle colors
        for (const vehicle of vehiclesData) {
          for (const colorOption of vehicle.colors) {
            const colorName = colorOption.name.toLowerCase();
            if (colorName.includes(variation) || variation.includes(colorName.split(' ')[0])) {
              return {
                name: colorOption.name,
                code: colorOption.code,
                hex: colorOption.hex,
                imageUrl: colorOption.imageUrl,
              };
            }
          }
        }
        return { name: color, code: color.toUpperCase().substring(0, 3) };
      }
    }
  }
  
  return null;
}

/**
 * Fuzzy match vehicle model
 */
export function fuzzyMatchModel(text) {
  const lowerText = text.toLowerCase().trim();
  
  // Direct match
  for (const vehicle of vehiclesData) {
    const fullName = `${vehicle.make} ${vehicle.model}`.toLowerCase();
    const modelName = vehicle.model.toLowerCase();
    const trimName = vehicle.trim?.toLowerCase() || '';
    
    if (lowerText.includes(fullName) || lowerText.includes(modelName)) {
      return vehicle;
    }
  }
  
  // Alias matching
  for (const [model, aliases] of Object.entries(MODEL_ALIASES)) {
    for (const alias of aliases) {
      if (lowerText.includes(alias)) {
        const matches = vehiclesData.filter(v => 
          v.model.toLowerCase().includes(model)
        );
        if (matches.length > 0) {
          return matches[0]; // Return first match
        }
      }
    }
  }
  
  // Make matching
  for (const [make, aliases] of Object.entries(MAKE_ALIASES)) {
    for (const alias of aliases) {
      if (lowerText.includes(alias)) {
        const matches = vehiclesData.filter(v => 
          v.make.toLowerCase() === make
        );
        if (matches.length > 0) {
          return matches[0];
        }
      }
    }
  }
  
  return null;
}

/**
 * Extract price range from text
 */
export function extractPriceRange(text) {
  const lowerText = text.toLowerCase();
  const range = { min: null, max: null };
  
  // Check price keywords
  for (const [keyword, bounds] of Object.entries(PRICE_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      if (bounds.min !== undefined) range.min = bounds.min;
      if (bounds.max !== undefined) range.max = bounds.max;
    }
  }
  
  // Extract numeric price ranges
  const underMatch = lowerText.match(/under\s*\$?(\d{1,3}(?:,\d{3})*(?:k|thousand)?)/i);
  if (underMatch) {
    const value = parsePrice(underMatch[1]);
    range.max = value;
  }
  
  const overMatch = lowerText.match(/(?:over|above|more than)\s*\$?(\d{1,3}(?:,\d{3})*(?:k|thousand)?)/i);
  if (overMatch) {
    const value = parsePrice(overMatch[1]);
    range.min = value;
  }
  
  const rangeMatch = lowerText.match(/\$?(\d{1,3}(?:,\d{3})*(?:k|thousand)?)\s*[-–—]\s*\$?(\d{1,3}(?:,\d{3})*(?:k|thousand)?)/i);
  if (rangeMatch) {
    range.min = parsePrice(rangeMatch[1]);
    range.max = parsePrice(rangeMatch[2]);
  }
  
  return range;
}

/**
 * Parse price string to number
 */
function parsePrice(priceStr) {
  const clean = priceStr.replace(/[,k]/gi, '');
  const num = parseInt(clean, 10);
  return priceStr.toLowerCase().includes('k') ? num * 1000 : num;
}

/**
 * Extract filters from natural language
 */
export function extractFilters(text) {
  const lowerText = text.toLowerCase();
  const filters = {
    type: null,
    drivetrain: null,
    fuelType: null,
    electrified: null,
    priceRange: extractPriceRange(text),
    mpg: null,
    color: extractColor(text),
    make: null,
    model: null,
  };
  
  // Vehicle type
  if (lowerText.includes('suv') || lowerText.includes('sport utility')) {
    filters.type = 'SUV';
    if (lowerText.includes('compact')) filters.category = 'Compact';
    if (lowerText.includes('midsize') || lowerText.includes('mid-size')) filters.category = 'Midsize';
    if (lowerText.includes('full-size') || lowerText.includes('full size')) filters.category = 'Full-Size';
  } else if (lowerText.includes('sedan')) {
    filters.type = 'Sedan';
  } else if (lowerText.includes('truck') || lowerText.includes('pickup')) {
    filters.type = 'Truck';
  } else if (lowerText.includes('compact') && !lowerText.includes('suv')) {
    filters.category = 'Compact';
  }
  
  // Drivetrain
  if (lowerText.match(/\bawd\b/) || lowerText.includes('all-wheel drive') || lowerText.includes('all wheel')) {
    filters.drivetrain = 'AWD';
  } else if (lowerText.match(/\b4wd\b/) || lowerText.includes('four-wheel drive') || lowerText.includes('4 wheel')) {
    filters.drivetrain = '4WD';
  } else if (lowerText.match(/\bfwd\b/) || lowerText.includes('front-wheel drive')) {
    filters.drivetrain = 'FWD';
  }
  
  // Fuel type
  if (lowerText.includes('hybrid')) {
    if (lowerText.includes('plug-in') || lowerText.includes('plugin') || lowerText.includes('phev')) {
      filters.fuelType = 'Plug-in Hybrid';
      filters.electrified = true;
    } else {
      filters.fuelType = 'Hybrid';
      filters.electrified = true;
    }
  } else if (lowerText.includes('electric') || lowerText.includes('ev') || lowerText.includes('battery')) {
    filters.fuelType = 'Electric';
    filters.electrified = true;
  } else if (lowerText.includes('gas') || lowerText.includes('gasoline') || lowerText.includes('petrol')) {
    filters.fuelType = 'Gasoline';
    filters.electrified = false;
  }
  
  // MPG
  const mpgMatch = lowerText.match(/(\d+)\s*mpg/i);
  if (mpgMatch) {
    filters.mpg = parseInt(mpgMatch[1], 10);
  } else if (lowerText.includes('efficient') || lowerText.includes('good gas mileage') || lowerText.includes('fuel efficient')) {
    filters.mpg = 35; // Minimum for "efficient"
  }
  
  // Make
  for (const [make, aliases] of Object.entries(MAKE_ALIASES)) {
    for (const alias of aliases) {
      if (lowerText.includes(alias)) {
        filters.make = make.charAt(0).toUpperCase() + make.slice(1);
        break;
      }
    }
  }
  
  // Model (fuzzy match)
  const modelMatch = fuzzyMatchModel(text);
  if (modelMatch) {
    filters.model = modelMatch.model;
    filters.make = modelMatch.make;
  }
  
  return filters;
}

/**
 * Detect intent from text
 */
export function detectIntent(text) {
  const lowerText = text.toLowerCase();
  
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(text)) {
      return intent;
    }
  }
  
  // Default to search if no clear intent
  return 'search';
}

/**
 * Parse comparison query (e.g., "blue Camry vs silver Accord")
 */
export function parseComparison(text) {
  const comparisonParts = text.split(/\s+vs\.?\s+|versus|compared to|compare/i);
  
  if (comparisonParts.length < 2) {
    return null;
  }
  
  const vehicle1Text = comparisonParts[0].trim();
  const vehicle2Text = comparisonParts[1].trim();
  
  const vehicle1 = fuzzyMatchModel(vehicle1Text);
  const vehicle2 = fuzzyMatchModel(vehicle2Text);
  
  const color1 = extractColor(vehicle1Text);
  const color2 = extractColor(vehicle2Text);
  
  return {
    vehicle1: vehicle1 ? { vehicle: vehicle1, color: color1 } : null,
    vehicle2: vehicle2 ? { vehicle: vehicle2, color: color2 } : null,
  };
}

/**
 * Main NLU function - parses user query and returns structured data
 */
export function parseQuery(text) {
  const intent = detectIntent(text);
  const filters = extractFilters(text);
  const comparison = intent === 'compare' ? parseComparison(text) : null;
  
  return {
    intent,
    filters,
    comparison,
    originalText: text,
  };
}

