// types/integration.ts
export interface IntegrationMetadata {
    last_sync?: string;
    error_message?: string;
}

export interface Integration {
    partner_id: string;
    status: "Installed" | "Pending" | "Disabled";
    metadata?: IntegrationMetadata;
}

export interface IntegrationsState {
    integrations: Integration[];
}