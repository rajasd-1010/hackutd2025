# Developer Documentation

## Architecture

### Frontend (React + TypeScript)
- **Location**: `src/`
- **Entry**: `src/main.tsx`
- **Components**: `src/components/`
- **Types**: `src/types/` (shared from `shared/types.ts`)
- **Styles**: `src/index.css`, `src/styles/theme.css`

### Backend (Node.js + TypeScript)
- **Location**: `server/`
- **Entry**: `server/index.ts`
- **Services**: `server/services/`
- **Data**: `server/data/vehicles.json`
- **Tests**: `server/tests/`

### Shared Types
- **Location**: `shared/types.ts`
- **OpenAPI**: `shared/schema.yaml`
- Used by both frontend and backend

## Key Services

### Financing Engine (`server/services/financing.ts`)
- Deterministic calculations
- Handles edge cases (0% APR, large down payments)
- Unit tested

### Image Service (`server/services/imageService.ts`)
- Validates image URLs
- Generates CDN URLs
- Provides Toyota-branded placeholders
- Caches thumbnails

### NLU Service (`server/services/nlu.ts`)
- Fuse.js for fuzzy matching
- Entity extraction
- Color mapping
- Intent detection

## Adding New Vehicles

1. Edit `server/data/vehicles.json`
2. Follow schema:
   ```json
   {
     "id": "TOY-2025-MODEL-TRIM-XXX",
     "vin": "4T1B11HK5KU123456",
     "make": "Toyota",
     "model": "ModelName",
     "trim": "Trim Level",
     "year": 2025,
     "msrp": 30000,
     "dealerPrice": 28500,
     "colors": [
       {
         "name": "Color Name",
         "code": "COL",
         "imageUrl": "https://...",
         "hex": "#FFFFFF"
       }
     ],
     ...
   }
   ```
3. Restart server

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm test
```

## Type Safety

All types are shared via `shared/types.ts`. Changes to types automatically affect both frontend and backend.

## Deployment

### Staging
```bash
docker-compose -f docker-compose.staging.yml up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

- Health check: `/health`
- Metrics: Structured logging
- Alerts: 5xx errors, image mismatch rates

## Contributing

1. Create feature branch
2. Write tests
3. Ensure type safety
4. Run linter and tests
5. Submit PR

