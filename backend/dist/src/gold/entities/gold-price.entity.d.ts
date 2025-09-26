export declare class GoldPrice {
    id: string;
    pricePerGram: number;
    pricePerOunce: number;
    currency: string;
    source: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    get pricePerKg(): number;
    get pricePerTola(): number;
}
