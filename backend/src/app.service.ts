import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: 'Gold Investment Platform API is running successfully! 🚀',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getStatus() {
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    return {
      status: 'healthy',
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
        unit: 'MB'
      },
      timestamp: new Date().toISOString(),
    };
  }
}
