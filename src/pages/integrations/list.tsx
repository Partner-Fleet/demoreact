import { useEffect, useRef, useCallback, useState } from "react";
import { Card, CircularProgress, Box } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import { generateUserJWT } from "../utils/jwtGenerator";
import { integrationsProvider } from "../../providers/integrationsProvider";
import type { Integration } from "../../types/integration";

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
        if (event.origin !== 'http://secondary.localhost.test:3000') return;

        try {
            const type = event.data;
            // console.log("type", type)
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

            // Only update if we have a valid partnerId and status
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

    useEffect(() => {
        if (userLoading || !user || initialized.current) return;

        const userJWT = getNewJwtToken();
        const container = document.getElementById('iframe-container');
        if (!container) return;

        // Add message listener
        window.addEventListener('message', handleIframeMessage);

        const initializeIframe = () => {
            if (initialized.current) return;
            initialized.current = true;

            const script = document.createElement("script");
            script.src = "http://secondary.localhost.test:3000/inapp_script.js";
            script.async = true;

            script.onload = () => {
                if (window.EmbeddedIframe) {
                    try {
                        const embeddedIframe = new window.EmbeddedIframe({
                            iframeOrigin: 'http://secondary.localhost.test:3000',
                            trustedOrigins: ['http://secondary.localhost.test:3000'],
                            containerId: 'iframe-container',
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

        return () => {
            window.removeEventListener('message', handleIframeMessage);
            const script = document.querySelector('script[src="http://secondary.localhost.test:3000/inapp_script.js"]');
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
                id="iframe-container"
                style={{
                    width: "100%",
                    height: "100%"
                }}
            />
        </Card>
    );
};