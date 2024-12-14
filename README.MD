# Refine Demo App with In-App Marketplace

## Basic Implementation without JWT
This demo application showcases the integration of a third-party marketplace within a Refine-based application. The main feature is an embedded iframe implementation that securely loads external marketplace content.

See Code Examples here: 
- [list_basic.tsx](./src/pages/integrations/list_basic.tsx)

## Technical Implementation Details

### Code Changes Analysis

#### Added Constants
```typescript
const IFRAME_ORIGIN = 'http://secondary.localhost.test:3000';
const IFRAME_SCRIPT = `${IFRAME_ORIGIN}/inapp_script.js`;
const CONTAINER_ID = 'iframe-container';
```
These constants were introduced to centralize configuration and improve maintainability. They define the source origin for the iframe content and script loading.

#### New State Management
```typescript
const initialized = useRef(false);
const iframeInstance = useRef<any>(null);
```
- `initialized`: Prevents double initialization of the iframe
- `iframeInstance`: Maintains a reference to the iframe for lifecycle management

#### Script Loading Implementation
The new version implements dynamic script loading:
```typescript
const script = document.createElement("script");
script.src = IFRAME_SCRIPT;
script.async = true;

script.onload = () => {
    if (window.EmbeddedIframe) {
        try {
            const embeddedIframe = new window.EmbeddedIframe({
                iframeOrigin: IFRAME_ORIGIN,
                trustedOrigins: [IFRAME_ORIGIN],
                containerId: CONTAINER_ID,
            });
            iframeInstance.current = embeddedIframe;
        } catch (error) {
            console.error('Error initializing iframe:', error);
        }
    }
};
```
Key changes:
- Asynchronous script loading
- Error handling for initialization failures
- Configuration of trusted origins for security
- Storage of iframe instance for later reference

#### Cleanup Mechanism
Added comprehensive cleanup functionality:
```typescript
return () => {
    const script = document.querySelector(`script[src="${IFRAME_SCRIPT}"]`);
    if (script?.parentNode) {
        script.parentNode.removeChild(script);
    }
    if (container) {
        container.innerHTML = '';
    }
    iframeInstance.current = null;
    initialized.current = false;
};
```
Improvements:
- Proper script tag removal
- Container cleanup
- Reference clearing
- State reset

#### Key Differences from Original Implementation

1. **Initialization:**
    - Original: No explicit initialization management
    - New: Uses `useRef` to track initialization state and prevent duplicates

2. **Script Handling:**
    - Original: No script management
    - New: Dynamic script loading with error handling and cleanup

3. **Security:**
    - Original: No origin restrictions
    - New: Explicit trusted origins configuration

4. **Memory Management:**
    - Original: No cleanup mechanism
    - New: Complete cleanup of DOM elements and references

5. **Error Handling:**
    - Original: No error handling
    - New: Try-catch block for initialization and error logging

# JWT Authentication Integration

#### JWT Implementation Overview
The application implements secure user authentication using JWTs (JSON Web Tokens) for iframe communication. This ensures secure data exchange between the parent application and the embedded marketplace.

See Code Examples here:
- [list_jwt.tsx](./src/pages/integrations/list_jwt.tsx)
- [jwtGenerator.ts](./src/pages/utils/jwtGenerator.ts)

#### Key JWT Changes
1. **User Identity Integration**
```typescript
const { data: user, isLoading: userLoading } = useGetIdentity();
```
- Added user identity management
- Loading state handling for user data
- Integration with Refine's identity system

2. **Token Generation**
```typescript
const getNewJwtToken = useCallback(() => {
    if (!user) return null;
    return generateUserJWT(user);
}, [user]);
```
- Memoized token generation
- User-dependent token creation
- Automatic token refresh capability

3. **Iframe Configuration Updates**
```typescript
const embeddedIframe = new window.EmbeddedIframe({
    // Previous configuration...
    initialToken: userJWT,
    getJwtToken: async () => getNewJwtToken(),
});
```
- Added initial token provision
- Token refresh callback integration
- Secure token passing mechanism

#### JWT Generator Utility
```typescript
interface JWTPayload {
    email: string;
    ufn: string;
    uln: string;
    fields: UserFields;
    account: AccountInfo;
    exp: number;
}
```

Key features:
- 5-minute token expiration
- User information encoding
- Account-specific metadata
- Role-based access control

#### Security Considerations
1. **Token Expiration**
```typescript
const exp = Math.floor(Date.now() / 1000) + (5 * 60);
```
- Short-lived tokens (5 minutes)
- Automatic expiration handling
- Requires regular renewal

2. **User Data Structure**
```typescript
const payload: JWTPayload = {
    email: user.email,
    ufn: user.name.split(' ')[0],
    uln: user.name.split(' ')[1],
    fields: {
        user_type: user.role || 'User',
    },
    account: {
        external_id: 'refine.com',
        name: 'Refine',
        tier: 'Enterprise',
    },
    exp: exp
};
```
- Standardized user information
- Role-based access control
- Account-level metadata

#### Loading State Management
```typescript
if (userLoading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
        </Box>
    );
}
```
- Graceful loading handling
- User experience optimization
- Prevents unauthorized access attempts

### Production Considerations

1. **Environment Variables**
- Move JWT_SECRET to environment variables
- Configure different secrets for different environments
- Implement secure secret management

2. **Token Security**
- Implement token rotation
- Add token blacklisting for revocation
- Monitor token usage patterns

3. **Error Handling**
- Implement token refresh error handling
- Add retry mechanisms for failed token generation
- Log security-related events

## Setup and Configuration

### JWT Setup
1. Configure JWT secret in environment variables:
```env
JWT_SECRET=your_secure_secret_here
```

2. Configure user roles and permissions:
```typescript
// Example user roles configuration
const USER_ROLES = {
    ADMIN: 'Admin',
    USER: 'User',
    GUEST: 'Guest'
};
```

## Security Best Practices
1. Always use environment variables for secrets
2. Implement proper token expiration
3. Use HTTPS in production
4. Regularly rotate JWT secrets
5. Monitor token usage and implement rate limiting

# Refine Demo App with In-App Marketplace with JWT and Integration Management

## Overview
This demo application showcases the integration of a third-party marketplace within a Refine-based application, featuring JWT authentication, integration state management, and cross-window communication.

## Implementation Files
- [list.tsx](./src/pages/integrations/list.tsx)
- [Integration Types](./src/types/integration.ts)
- [Integrations Provider](./src/providers/integrationsProvider.ts)

## Technical Implementation Details

### Integration State Management

#### State Initialization
```typescript
const [integrations, setIntegrations] = useState<Integration[]>([]);

// Load integrations on mount
useEffect(() => {
    const loadIntegrations = async () => {
        const stored = await integrationsProvider.getAll();
        setIntegrations(stored);
    };
    loadIntegrations();
}, []);
```
- Maintains integration state using React useState
- Loads existing integrations on component mount
- Uses provider pattern for data access

#### Cross-Window Communication
```typescript
const handleIframeMessage = useCallback(async (event: MessageEvent) => {
    if (event.origin !== IFRAME_ORIGIN) return;

    try {
        const type = event.data;
        let partnerId = '';
        let status = '';

        switch(type) {
            case 'google-tag-manager_enabled':
                partnerId = 'google-tag-manager';
                status = 'Created';
                break;
            case 'google-tag-manager_disabled':
                partnerId = 'google-tag-manager';
                status = 'Disabled';
                break;
            case 'chilipiper_enabled':
                partnerId = 'chili-piper-4937abd9-0cc2-4f17-94ab-665609303b8f';
                status = 'Created';
                break;
            case 'chilipiper_disabled':
                partnerId = 'chili-piper-4937abd9-0cc2-4f17-94ab-665609303b8f';
                status = 'Disabled';
                break;
        }
```

Key features:
1. **Message Handling**
   - Origin validation for security
   - Structured message parsing
   - Partner-specific status updates
   - Error boundary implementation

2. **Integration Updates**
```typescript
if (partnerId && status) {
    const updated = await integrationsProvider.updateStatus(partnerId, status, {});
    setIntegrations(prev =>
        prev.map(integration =>
            integration.partner_id === partnerId ? updated : integration
        )
    );
}
```
- Atomic state updates
- Optimistic UI updates
- Error handling

### Enhanced Iframe Configuration

#### Integration State Injection
```typescript
const embeddedIframe = new window.EmbeddedIframe({
    // Previous configuration...
    integrations: integrations
});
```
- Passes current integration state to iframe
- Enables synchronized state between parent and child

#### Cleanup Enhancements
```typescript
return () => {
    window.removeEventListener('message', handleIframeMessage);
    // Previous cleanup...
};
```
- Message listener cleanup
- Prevents memory leaks
- Proper event handler management

### Supported Integrations

Currently supported partners:
1. Google Tag Manager
   - States: Enabled/Disabled
   - Partner ID: `google-tag-manager`

2. Chili Piper
   - States: Enabled/Disabled
   - Partner ID: `chili-piper-4937abd9-0cc2-4f17-94ab-665609303b8f`

## Setup and Configuration

### Integration Provider Setup
1. Configure the integration provider:
```typescript
// providers/integrationsProvider.ts
export const integrationsProvider = {
    getAll: async () => {
        // Implementation
    },
    updateStatus: async (partnerId, status, data) => {
        // Implementation
    }
};
```

### Message Handling
1. Ensure IFRAME_ORIGIN matches your deployment configuration
2. Add new integration types to the message handler
3. Configure appropriate partner IDs

## Security Considerations

1. **Origin Validation**
```typescript
if (event.origin !== IFRAME_ORIGIN) return;
```
- Strict origin checking
- Prevents unauthorized messages
- Configuration-based validation

2. **State Management**
- Atomic updates
- Validation before state changes
- Error boundary implementation

## Development Guidelines

### Adding New Integrations
1. Add partner ID constant
2. Implement message handling cases
3. Update integration provider
4. Add type definitions

### Testing
- Test message handling
- Validate state updates
- Verify cleanup
- Test error scenarios

## Setup and Running

### Prerequisites
- Node.js (version X.X.X)
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
- Set up your `.env` file with necessary variables
- Configure the `IFRAME_ORIGIN` if needed

### Development
Run the development server:
```bash
npm run dev
```

## Contributing
Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.
