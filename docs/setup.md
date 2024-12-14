# Setup Guide

## Prerequisites
- Node.js (version X.X.X)
- npm or yarn
- Git

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```env
# Required
JWT_SECRET=your_secure_secret_here
IFRAME_ORIGIN=http://secondary.localhost.test:3000

# Optional
NODE_ENV=development
```

### 4. Integration Provider Configuration
Configure the integration provider in `src/providers/integrationsProvider.ts`:
```typescript
export const integrationsProvider = {
    // Your configuration
};
```

## Development Environment

### Starting Development Server
```bash
npm run dev
# or
yarn dev
```

### Building for Production
```bash
npm run build
# or
yarn build
```

## Configuration Options

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT generation
- `JWT_EXPIRY`: Token expiration time (default: 5 minutes)

### Iframe Configuration
- `IFRAME_ORIGIN`: Origin URL for iframe content
- `CONTAINER_ID`: DOM container ID for iframe

## Troubleshooting

### Common Issues
1. JWT token errors
    - Check JWT_SECRET configuration
    - Verify token expiration settings

2. Iframe loading issues
    - Verify IFRAME_ORIGIN configuration
    - Check browser console for errors

### Support
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: [Main README](../README.md)

## Next Steps
- Review [Basic Implementation](./basic-implementation.md)
- Check [Security Guidelines](./security.md)