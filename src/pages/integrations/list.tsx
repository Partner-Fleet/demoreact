import { useEffect, useRef, useCallback, useState } from "react";
import { Card, CircularProgress, Box } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { generateUserJWT } from "../utils/jwtGenerator";
import { integrationsProvider } from "../../providers/integrationsProvider";
import type { Integration } from "../../types/integration";

// Constants
const IFRAME_ORIGIN = 'http://secondary.localhost.test:3000';
const IFRAME_SCRIPT = `${IFRAME_ORIGIN}/inapp_script.js`;
const CONTAINER_ID = 'iframe-container';

declare global {
    interface Window {
        EmbeddedIframe: any;
    }
}

export const IntegrationsList = () => {
    const initialized = useRef(false);
    const iframeInstance = useRef<any>(null);
    const { data: user, isLoading: userLoading } = useGetIdentity();
    const [integrations, setIntegrations] = useState<Integration[]>([]);

    const getNewJwtToken = useCallback(() => {
        if (!user) return null;
        return generateUserJWT(user);
    }, [user]);

    // Load integrations on mount
    useEffect(() => {
        const loadIntegrations = async () => {
            const stored = await integrationsProvider.getAll();
            setIntegrations(stored);
        };
        loadIntegrations();
    }, []);

    // Handle messages from iframe
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
                default:
                    return;
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

    // Initialize iframe when user is loaded
    useEffect(() => {
        if (userLoading || !user || initialized.current) return;

        const userJWT = getNewJwtToken();
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        // Add message listener
        window.addEventListener('message', handleIframeMessage);

        const initializeIframe = () => {
            if (initialized.current) return;
            initialized.current = true;

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
                            initialToken: userJWT,
                            getJwtToken: async () => getNewJwtToken(),
                            integrations: integrations
                        });
                        iframeInstance.current = embeddedIframe;
                    } catch (error) {
                        console.error('Error initializing iframe:', error);
                    }
                }
            };

            document.body.appendChild(script);
        };

        requestAnimationFrame(() => {
            initializeIframe();
        });

        // Cleanup function
        return () => {
            window.removeEventListener('message', handleIframeMessage);
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
    }, [user, userLoading, getNewJwtToken, handleIframeMessage, integrations]);

    if (userLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card sx={{ p: 2 }}>
            <div
                id={CONTAINER_ID}
                style={{
                    width: "100%",
                    height: "100%"
                }}
            />
        </Card>
    );
};