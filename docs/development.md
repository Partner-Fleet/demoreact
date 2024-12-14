# Development Guide

## Adding New Integrations

### 1. Define Integration Type
```typescript
// types/integration.ts
interface Integration {
    partner_id: string;
    status: 'Created' | 'Disabled';
    data?: Record<string, any>;
}
```

### 2. Add Partner Constants
```typescript
const PARTNER_ID = 'new-integration-id';
const ENABLE_EVENT = 'new-integration_enabled';
const DISABLE_EVENT = 'new-integration_disabled';
```

### 3. Update Message Handler
```typescript
switch(type) {
    // Existing cases...
    case 'new-integration_enabled':
        partnerId = 'new-integration-id';
        status = 'Created';
        break;
    case 'new-integration_disabled':
        partnerId = 'new-integration-id';
        status = 'Disabled';
        break;
}
```

### 4. Update Provider
```typescript
// providers/integrationsProvider.ts
const supportedPartners = [
    // Existing partners...
    'new-integration-id'
];
```

## Testing

### Unit Tests
1. Message handling
2. State updates
3. Integration lifecycle
4. Error scenarios

### Integration Tests
1. Cross-window communication
2. State synchronization
3. Token refresh flow
4. Cleanup procedures

## Development Workflow

### 1. Feature Development
```bash
git checkout -b feature/new-integration
# Make changes
git commit -m "Add new integration"
git push origin feature/new-integration
```

### 2. Testing
```bash
npm run test
npm run test:integration
```

### 3. Building
```bash
npm run build
```

## Code Style Guidelines

### TypeScript
- Use strict type checking
- Document complex types
- Avoid any when possible

### React
- Functional components
- Custom hooks for logic
- Proper cleanup in useEffect

### Error Handling
- Try-catch blocks
- Error boundaries
- Proper error logging

## Related Documentation
- [Basic Implementation](./basic-implementation.md)
- [Integration Management](./integration-management.md)
- [Security Guidelines](./security.md)