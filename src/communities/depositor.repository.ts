import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Depositor } from './entities/depositor.entity';

@Injectable()
export class DepositorRepository extends Repository<Depositor> {
  constructor(private dataSource: DataSource) {
    super(Depositor, dataSource.createEntityManager());
  }

  async findByCommunity(communityId: string): Promise<Depositor[]> {
    return this.find({
      where: { communityId },
      relations: ['user'],
      order: { depositedAt: 'DESC' }
    });
  }

  async getTotalDepositedByCommunity(communityId: string): Promise<number> {
    const result = await this.createQueryBuilder('depositor')
      .select('SUM(depositor.amount)', 'total')
      .where('depositor.communityId = :communityId', { communityId })
      .getRawOne();
    
    return result.total || 0;
  }
} 