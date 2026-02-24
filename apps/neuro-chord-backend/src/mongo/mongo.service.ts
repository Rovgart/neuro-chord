import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError } from 'mongodb';
import type { Model } from 'mongoose';
import { UserStats } from './schemas/user-stats.schema';
@Injectable()
export class MongoService {
    constructor(
        @InjectModel(UserStats.name) private readonly userStatsModel: Model<UserStats>,
    ) {}
    @OnEvent('user.stats.updated')
    async handleUserStatsUpdatedEvent(payload: { userId: number; stats: Partial<UserStats> }) {
        const { userId, stats } = payload;
        await this.userStatsModel.findOneAndUpdate(
            { userId },
            { $set: stats },
            { upsert: true, new: true },
        );
    }
    @OnEvent('user.registered')
    async handleRegisteredEvent(payload:{userId:number, email:string}){
        try {
             const { userId, email } = payload;
            await this.userStatsModel.create({
              userId: userId,
              currentStreak: 0,
              lastLogin: new Date(),
              level: 0,
              xp: 0,
            });
        } catch (error) {
            if(error instanceof MongoServerError){
                if(error.code ===11000){
                    
                }
            }
            
        }
       
    }
    
}
