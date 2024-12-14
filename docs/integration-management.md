# Integration Management

Guide for implementing full integration state management and cross-window communication.

## Code Example
See [list.tsx](./src/pages/integrations/list.tsx) for the complete implementation.

## State Management

### Integration State Initialization
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

### Message Handler Implementation
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

        if (partnerId && status) {
            const updated = await integrationsProvider.updateStatus(partnerId, status, {});
            setIntegrations(prev =>
                prev.map(integration =>
                    integration.partner_id === partnerId ? updated : integration
                )
            );
        }
    } catch (error) {
        console.error('Error handling iframe message:', error);
    }
}, []);
```

## Supported Integrations

### Google Tag Manager
- Partner ID: `google-tag-manager`
- States: Enabled/Disabled
- Events: `google-tag-manager_enabled`, `google-tag-manager_disabled`

### Chili Piper
- Partner ID: `chili-piper-4937abd9-0cc2-4f17-94ab-665609303b8f`
- States: Enabled/Disabled
- Events: `chilipiper_enabled`, `chilipiper_disabled`

## Integration Provider Setup
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

## Enhanced Iframe Configuration
```typescript
const embeddedIframe = new window.EmbeddedIframe({
    iframeOrigin: IFRAME_ORIGIN,
    trustedOrigins: [IFRAME_ORIGIN],
    containerId: CONTAINER_ID,
    integrations: integrations
});
```

## Cleanup Management
```typescript
return () => {
    window.removeEventListener('message', handleIframeMessage);
    // Previous cleanup code...
};
```

## Next Steps
- Review [Security Guidelines](./security.md)
- Check [Development Guide](./development.md) for adding new integrations