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

    const getNewJwtToken = useCallback(() => {
        if (!user) return null;
        return generateUserJWT(user);
    }, [user]);

    // Initialize iframe when user is loaded
    useEffect(() => {
        if (userLoading || !user || initialized.current) return;

        const userJWT = getNewJwtToken();
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        // Add message listener

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
    }, [user, userLoading, getNewJwtToken]);

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