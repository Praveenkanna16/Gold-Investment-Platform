import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async findForUser(userId: string): Promise<Transaction[]> {
    return this.txRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async create(tx: Partial<Transaction>): Promise<Transaction> {
    const entity = this.txRepo.create(tx);
    return this.txRepo.save(entity);
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    await this.txRepo.update(id, data);
    return this.txRepo.findOne({ where: { id } });
  }

  async listAll(): Promise<Transaction[]> {
    return this.txRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.txRepo.findOne({ where: { id } });
  }
}
