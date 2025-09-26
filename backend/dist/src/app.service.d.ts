export declare class AppService {
    getHealth(): {
        message: string;
        timestamp: string;
        version: string;
        environment: string;
    };
    getStatus(): {
        status: string;
        uptime: number;
        memory: {
            used: number;
            total: number;
            external: number;
            unit: string;
        };
        timestamp: string;
    };
}
