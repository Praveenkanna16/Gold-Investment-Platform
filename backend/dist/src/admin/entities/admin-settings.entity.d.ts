export type BannerType = 'info' | 'warning' | 'success' | 'error';
export declare class AdminSettings {
    id: string;
    maintenanceMode: boolean;
    minBuyAmount: number;
    priceSource: 'live' | 'manual';
    manualPrice?: number | null;
    features: {
        buy: boolean;
        sell: boolean;
        sip: boolean;
        admin: boolean;
    };
    banner: {
        show: boolean;
        text: string;
        type: BannerType;
    };
    trust: {
        partnerName: string;
        purity: string;
        auditUrl?: string;
        insured: boolean;
        storageInfo?: string;
    };
    fees: {
        spreadBps: number;
        convenienceFeeBps: number;
        gstRate: number;
    };
    disclosures: {
        howItWorksUrl?: string;
        faqUrl?: string;
        termsUrl?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
