import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { parseQuery, parseComparison, extractFilters, fuzzyMatchModel } from './utils/nlu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'key.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load vehicle data
const vehiclesData = JSON.parse(
  readFileSync(join(__dirname, 'data/vehicles.json'), 'utf-8')
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all vehicles with filtering, pagination, and search
app.get('/api/vehicles', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      type, 
      make, 
      drivetrain, 
      fuelType,
      minPrice,
      maxPrice,
      minMpg 
    } = req.query;

    let filtered = [...vehiclesData];

    // Text search (fuzzy)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(v => 
        v.model.toLowerCase().includes(searchLower) ||
        v.make.toLowerCase().includes(searchLower) ||
        v.trim?.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filters
    if (type) filtered = filtered.filter(v => v.type === type);
    if (make) filtered = filtered.filter(v => v.make === make);
    if (drivetrain) filtered = filtered.filter(v => v.drivetrain === drivetrain);
    if (fuelType) filtered = filtered.filter(v => v.fuelType === fuelType);
    if (minPrice) filtered = filtered.filter(v => v.msrp >= parseInt(minPrice));
    if (maxPrice) filtered = filtered.filter(v => v.msrp <= parseInt(maxPrice));
    if (minMpg) filtered = filtered.filter(v => v.mpg.combined >= parseInt(minMpg));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginated = filtered.slice(start, end);

    res.json({
      vehicles: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vehicle by ID
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const vehicle = vehiclesData.find(v => v.id === req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search vehicles with natural language
app.post('/api/vehicles/search', (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.json({ vehicles: vehiclesData, count: vehiclesData.length });
    }

    const parsed = parseQuery(query);
    const filters = parsed.filters;
    
    let matching = [...vehiclesData];

    // Apply filters
    if (filters.type) {
      matching = matching.filter(v => v.type === filters.type);
    }
    if (filters.category) {
      matching = matching.filter(v => v.category === filters.category);
    }
    if (filters.drivetrain) {
      matching = matching.filter(v => v.drivetrain === filters.drivetrain);
    }
    if (filters.fuelType) {
      matching = matching.filter(v => v.fuelType === filters.fuelType);
    }
    if (filters.electrified !== null) {
      matching = matching.filter(v => v.electrified === filters.electrified);
    }
    if (filters.priceRange.min) {
      matching = matching.filter(v => v.msrp >= filters.priceRange.min);
    }
    if (filters.priceRange.max) {
      matching = matching.filter(v => v.msrp <= filters.priceRange.max);
    }
    if (filters.mpg) {
      matching = matching.filter(v => v.mpg.combined >= filters.mpg);
    }
    if (filters.make) {
      matching = matching.filter(v => v.make === filters.make);
    }
    if (filters.model) {
      matching = matching.filter(v => v.model.toLowerCase().includes(filters.model.toLowerCase()));
    }

    res.json({
      vehicles: matching,
      filters: filters,
      count: matching.length,
      intent: parsed.intent,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error searching vehicles' });
  }
});

// Compare two vehicles
app.post('/api/compare', (req, res) => {
  try {
    const { vehicle1, vehicle2, query, color1, color2 } = req.body;
    
    let v1, v2;
    let selectedColor1, selectedColor2;

    // If query provided, parse it
    if (query) {
      const comparison = parseComparison(query);
      if (comparison?.vehicle1?.vehicle) {
        v1 = comparison.vehicle1.vehicle;
        selectedColor1 = comparison.vehicle1.color;
      }
      if (comparison?.vehicle2?.vehicle) {
        v2 = comparison.vehicle2.vehicle;
        selectedColor2 = comparison.vehicle2.color;
      }
    }

    // If vehicle IDs provided
    if (vehicle1 && !v1) {
      v1 = vehiclesData.find(v => v.id === vehicle1);
    }
    if (vehicle2 && !v2) {
      v2 = vehiclesData.find(v => v.id === vehicle2);
    }

    // If color specified, find matching color
    if (v1 && color1) {
      selectedColor1 = v1.colors.find(c => 
        c.name.toLowerCase().includes(color1.toLowerCase()) ||
        c.code.toLowerCase() === color1.toLowerCase()
      ) || v1.colors[0];
    } else if (v1 && !selectedColor1) {
      selectedColor1 = v1.colors[0];
    }

    if (v2 && color2) {
      selectedColor2 = v2.colors.find(c => 
        c.name.toLowerCase().includes(color2.toLowerCase()) ||
        c.code.toLowerCase() === color2.toLowerCase()
      ) || v2.colors[0];
    } else if (v2 && !selectedColor2) {
      selectedColor2 = v2.colors[0];
    }

    if (!v1 || !v2) {
      return res.status(400).json({ 
        error: 'Could not find both vehicles to compare',
        suggestions: vehiclesData.slice(0, 5).map(v => ({ 
          id: v.id, 
          name: `${v.make} ${v.model} ${v.trim}` 
        }))
      });
    }

    // Calculate financing for both vehicles
    const calculateFinancing = (vehicle, price) => {
      const buy = {
        monthly: Math.round((price * 0.8) / 60), // 60 months, 20% down
        total: price,
        interest: Math.round(price * 0.15),
      };
      const lease = {
        monthly: Math.round((price * 0.45) / 36), // 36 months, 55% residual
        total: Math.round(price * 0.45),
        residual: Math.round(price * 0.55),
      };
      const subscription = {
        monthly: Math.round((price * 0.6) / 36 + 150), // Includes insurance/maintenance
        total: Math.round((price * 0.6) / 36 + 150) * 36,
      };
      return { buy, lease, subscription };
    };

    const financing1 = calculateFinancing(v1, v1.msrp);
    const financing2 = calculateFinancing(v2, v2.msrp);

    // Create comparison
    const comparison = {
      vehicle1: {
        ...v1,
        selectedColor: selectedColor1,
        imageUrl: selectedColor1?.imageUrl || v1.colors[0].imageUrl,
      },
      vehicle2: {
        ...v2,
        selectedColor: selectedColor2,
        imageUrl: selectedColor2?.imageUrl || v2.colors[0].imageUrl,
      },
      differences: {
        price: v2.msrp - v1.msrp,
        mpg: v2.mpg.combined - v1.mpg.combined,
        horsepower: v2.engine.horsepower - v1.engine.horsepower,
      },
      similarities: [],
      financing: {
        vehicle1: financing1,
        vehicle2: financing2,
      },
    };

    // Find similarities
    if (v1.type === v2.type) comparison.similarities.push('Same vehicle type');
    if (v1.drivetrain === v2.drivetrain) comparison.similarities.push('Same drivetrain');
    if (v1.fuelType === v2.fuelType) comparison.similarities.push('Same fuel type');
    if (Math.abs(v1.msrp - v2.msrp) < 5000) comparison.similarities.push('Similar price range');

    res.json(comparison);
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Error comparing vehicles' });
  }
});

// AI Chat endpoint with NLU
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Parse query using NLU
    const parsed = parseQuery(message);
    const filters = parsed.filters;
    
    // Find matching vehicles
    let matchingVehicles = [...vehiclesData];
    if (filters.type) matchingVehicles = matchingVehicles.filter(v => v.type === filters.type);
    if (filters.drivetrain) matchingVehicles = matchingVehicles.filter(v => v.drivetrain === filters.drivetrain);
    if (filters.fuelType) matchingVehicles = matchingVehicles.filter(v => v.fuelType === filters.fuelType);
    if (filters.priceRange.max) matchingVehicles = matchingVehicles.filter(v => v.msrp <= filters.priceRange.max);
    if (filters.make) matchingVehicles = matchingVehicles.filter(v => v.make === filters.make);
    if (filters.model) matchingVehicles = matchingVehicles.filter(v => v.model.toLowerCase().includes(filters.model.toLowerCase()));

    const isComparisonRequest = parsed.intent === 'compare';
    const isSearchRequest = matchingVehicles.length > 0 && parsed.intent === 'search';

    if (!process.env.OPENAI_API_KEY) {
      if (isSearchRequest && matchingVehicles.length > 0) {
        return res.json({
          response: `I found ${matchingVehicles.length} vehicle(s) matching your criteria.`,
          vehicles: matchingVehicles.slice(0, 5),
          action: 'search',
          error: false,
        });
      }
      return res.json({
        response: 'OpenAI API key not configured.',
        error: true,
      });
    }

    // Build context
    const vehiclesContext = vehiclesData.map(v => 
      `${v.make} ${v.model} ${v.trim} (${v.year}): $${v.msrp.toLocaleString()}, ${v.mpg.combined} MPG, ${v.type}, ${v.drivetrain}, ${v.fuelType}`
    ).join('\n');

    const systemPrompt = `You are a helpful AI assistant for Toyota's vehicle shopping and finance platform.

Available vehicles:
${vehiclesContext}

Key information:
- Toyota offers competitive financing with APRs typically ranging from 2.9% to 7.9%
- Leasing options are available with terms typically 24-48 months
- Subscription services are available with monthly all-inclusive payments
- Toyota Safety Sense is standard on most Toyota models
- Hybrid models offer excellent fuel economy

When users ask to find vehicles, respond naturally and indicate that matching vehicles have been found.
When users ask to compare vehicles, help them understand the differences.

Be friendly, knowledgeable, and helpful.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const response = completion.choices[0].message.content;

    res.json({
      response,
      vehicles: isSearchRequest ? matchingVehicles.slice(0, 5) : null,
      action: isComparisonRequest ? 'compare' : (isSearchRequest ? 'search' : 'chat'),
      error: false,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      response: 'Sorry, I encountered an error. Please try again.',
      error: true,
    });
  }
});

// Calculate payment
app.post('/api/calculate-payment', (req, res) => {
  try {
    const { price, downPayment, apr, termMonths, isLease, isSubscription, residualValue, tradeInValue, taxRate } = req.body;

    const tax = taxRate || 0.08;
    const adjustedPrice = price * (1 + tax);
    const netPrice = adjustedPrice - (tradeInValue || 0) - downPayment;

    if (isSubscription) {
      const baseMonthly = netPrice / termMonths;
      const insurance = 150;
      const maintenance = 100;
      const monthlyPayment = baseMonthly + insurance + maintenance;
      const totalCost = monthlyPayment * termMonths + downPayment + (tradeInValue || 0);

      res.json({
        monthlyPayment: Math.round(monthlyPayment),
        totalCost: Math.round(totalCost),
        breakdown: {
          vehicle: Math.round(baseMonthly),
          insurance: insurance,
          maintenance: maintenance,
          taxes: Math.round(price * tax),
        },
        type: 'subscription',
      });
    } else if (isLease) {
      const residual = residualValue || Math.round(price * 0.55);
      const depreciation = netPrice - residual;
      const monthlyDepreciation = depreciation / termMonths;
      const moneyFactor = apr / 2400;
      const monthlyFinance = (netPrice + residual) * moneyFactor;
      const monthlyPayment = monthlyDepreciation + monthlyFinance;
      const totalCost = monthlyPayment * termMonths + downPayment + (tradeInValue || 0);

      res.json({
        monthlyPayment: Math.round(monthlyPayment),
        totalCost: Math.round(totalCost),
        residualValue: residual,
        breakdown: {
          depreciation: Math.round(monthlyDepreciation),
          finance: Math.round(monthlyFinance),
          taxes: Math.round(price * tax),
        },
        type: 'lease',
      });
    } else {
      const principal = netPrice;
      const monthlyRate = apr / 100 / 12;
      let monthlyPayment;

      if (monthlyRate === 0) {
        monthlyPayment = principal / termMonths;
      } else {
        monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
      }

      const totalCost = monthlyPayment * termMonths + downPayment + (tradeInValue || 0);
      const totalInterest = totalCost - adjustedPrice;

      res.json({
        monthlyPayment: Math.round(monthlyPayment),
        totalCost: Math.round(totalCost),
        totalInterest: Math.round(totalInterest),
        breakdown: {
          principal: Math.round(principal),
          interest: Math.round(totalInterest),
          taxes: Math.round(price * tax),
          tradeIn: tradeInValue || 0,
        },
        type: 'purchase',
      });
    }
  } catch (error) {
    console.error('Payment calculation error:', error);
    res.status(500).json({ error: 'Error calculating payment' });
  }
});

// Request dealer offers
app.post('/api/request-offers', (req, res) => {
  try {
    const { vehicleId, zip } = req.body;
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Mock dealer offers
    const dealers = [
      { id: 'dallas-toyota', name: 'Dallas Toyota', city: 'Dallas', state: 'TX', phone: '(214) 555-0100' },
      { id: 'plano-toyota', name: 'Plano Toyota', city: 'Plano', state: 'TX', phone: '(972) 555-0101' },
      { id: 'frisco-toyota', name: 'Frisco Toyota', city: 'Frisco', state: 'TX', phone: '(972) 555-0102' },
    ];

    const offers = dealers.map(dealer => {
      const discount = Math.floor(Math.random() * 2000) + 500;
      const fees = Math.floor(Math.random() * 1500) + 800;
      const finalPrice = vehicle.msrp - discount + fees;

      return {
        dealerId: dealer.id,
        dealerName: dealer.name,
        dealerLocation: `${dealer.city}, ${dealer.state}`,
        dealerPhone: dealer.phone,
        originalPrice: vehicle.msrp,
        discount: discount,
        fees: fees,
        finalPrice: finalPrice,
        savings: discount - fees > 0 ? discount - fees : 0,
      };
    });

    res.json(offers);
  } catch (error) {
    console.error('Error requesting offers:', error);
    res.status(500).json({ error: 'Error requesting offers' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Make sure to add your OPENAI_API_KEY to server/key.env`);
});

