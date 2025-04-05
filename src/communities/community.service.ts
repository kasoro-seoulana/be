import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { Community } from './entities/community.entity';
import { CommunityRepository } from './community.repository';

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async getAllCommunities(): Promise<Community[]> {
    return this.communityRepository.find({
      relations: ['creator'],
      order: {
        lastMessageTime: 'DESC',
        createdAt: 'DESC',
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        creatorId: true,
        lastMessageTime: true,
        contractAddress: true,
        bountyAmount: true,
        timeLimit: true,
        baseFeePercentage: true,
        walletAddress: true,
        creator: {
          id: true,
          xId: true,
          username: true,
          displayName: true,
          profileImageUrl: true,
        }
      }
    });
  }

  async getCommunityById(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }

    return community;
  }

  async createCommunity(createCommunityDto: CreateCommunityDto, userId: string): Promise<Community> {
    // Handle the case when no wallet address is provided
    const community = this.communityRepository.create({
      ...createCommunityDto,
      creatorId: userId,
      // Set bountyAmount to 0 if walletAddress is not provided
      bountyAmount: createCommunityDto.walletAddress ? createCommunityDto.bountyAmount : 0,
    });

    return this.communityRepository.save(community);
  }

  async getCommunityWithMessages(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator', 'messages', 'messages.sender'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }

    return community;
  }

  async updateLastMessageTime(id: string, timestamp: Date = new Date()): Promise<void> {
    // First check if the community exists
    await this.getCommunityById(id);
    
    // Then update the lastMessageTime
    await this.communityRepository.updateLastMessageTime(id, timestamp);
    
    console.log(`Updated lastMessageTime for community ${id} to ${timestamp}`);
  }

  async updateBounty(id: string, amount: number): Promise<void> {
    // First get the community to check if it exists
    const community = await this.getCommunityById(id);
    
    // Update the bounty amount - add the new deposit to the existing amount
    const newBountyAmount = (community.bountyAmount || 0) + amount;
    
    // Update the community with the new bounty amount
    await this.communityRepository.update(id, { bountyAmount: newBountyAmount });
    
    console.log(`Updated bounty for community ${id} to ${newBountyAmount} SOL`);
  }
}