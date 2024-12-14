# Refine Demo App with In-App Marketplace

A demo application showcasing the integration of a third-party marketplace within a Refine-based application, featuring three implementation stages:

1. Basic Implementation - Simple iframe integration
2. JWT Authentication - Secure communication
3. Full Integration Management - Complete state and integration handling

## Documentation Structure

### Implementation Guides
- [Basic Implementation](./docs/basic-implementation.md) - Core iframe setup and configuration
- [JWT Authentication](./docs/jwt-authentication.md) - Adding secure authentication
- [Integration Management](./docs/integration-management.md) - Full state management implementation

### Supporting Documentation
- [Security Guidelines](./docs/security.md) - Security best practices and considerations
- [Setup Guide](./docs/setup.md) - Installation and configuration instructions
- [Development Guide](./docs/development.md) - Development workflow and guidelines

## Quick Links

### Code Examples
- Basic Implementation: [list_basic.tsx](./src/pages/integrations/list_basic.tsx)
- JWT Implementation: [list_jwt.tsx](./src/pages/integrations/list_jwt.tsx)
- Full Integration: [list.tsx](./src/pages/integrations/list.tsx)

### Supporting Files
- [JWT Generator](./src/pages/utils/jwtGenerator.ts)
- [Integration Types](./src/types/integration.ts)
- [Integrations Provider](./src/providers/integrationsProvider.ts)

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

See our [Setup Guide](./docs/setup.md) for detailed instructions.

## Contributing
Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.