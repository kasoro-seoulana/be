import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityRepository } from './community.repository';
import { CommunityGateway } from './community.gateway';
import { Community } from './entities/community.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community]),
    UserModule
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRepository, CommunityGateway],
  exports: [CommunityService, CommunityGateway]
})
export class CommunityModule {}
