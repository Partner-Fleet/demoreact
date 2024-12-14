# Basic Implementation

This guide covers the base iframe implementation without JWT authentication.

## Code Example
See [list_basic.tsx](./src/pages/integrations/list_basic.tsx) for the complete implementation.

## Core Components

### Constants
```typescript
const IFRAME_ORIGIN = 'http://secondary.localhost.test:3000';
const IFRAME_SCRIPT = `${IFRAME_ORIGIN}/inapp_script.js`;
const CONTAINER_ID = 'iframe-container';
```

### State Management
```typescript
const initialized = useRef(false);
const iframeInstance = useRef<any>(null);
```
- `initialized`: Prevents double initialization of the iframe
- `iframeInstance`: Maintains a reference to the iframe for lifecycle management

### Script Loading Implementation
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

### Cleanup Mechanism
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

## Key Features
1. Asynchronous script loading
2. Error handling for initialization failures
3. Proper cleanup and memory management
4. Security through origin configuration

## Implementation Steps

1. **Setup Constants**
   - Configure IFRAME_ORIGIN
   - Define script source
   - Set container ID

2. **Initialize State**
   - Create initialization flag
   - Setup iframe instance reference

3. **Script Loading**
   - Create script element
   - Configure async loading
   - Handle load events
   - Initialize iframe instance

4. **Cleanup**
   - Remove script tags
   - Clear container
   - Reset state
   - Clean up references

## Next Steps
- Add JWT authentication - See [JWT Authentication](./jwt-authentication.md)
- Implement state management - See [Integration Management](./integration-management.md)