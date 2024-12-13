// providers/integrationsProvider.ts
import { Integration } from "../types/integration";

const STORAGE_KEY = "integration-statuses";

export const integrationsProvider = {
    getAll: async (): Promise<Integration[]> => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    },

    updateStatus: async (partnerId: string, status: Integration['status'], metadata?: any): Promise<Integration> => {
        const integrations = await integrationsProvider.getAll();
        const updatedIntegrations = integrations.map(integration =>
            integration.partner_id === partnerId
                ? { ...integration, status, metadata: { ...integration.metadata, ...metadata } }
                : integration
        );

        if (!updatedIntegrations.find(i => i.partner_id === partnerId)) {
            updatedIntegrations.push({
                partner_id: partnerId,
                status,
                metadata: metadata || {}
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIntegrations));
        return updatedIntegrations.find(i => i.partner_id === partnerId)!;
    }
};