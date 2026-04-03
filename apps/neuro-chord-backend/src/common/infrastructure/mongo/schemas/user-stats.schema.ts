import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserStatsDocument = UserStats & Document;

@Schema({ 
  timestamps: true, // Automatyczne createdAt i updatedAt - zbawienne przy debugowaniu
  collection: 'user_stats' 
})
export class UserStats {
  @Prop({ required: true, unique: true, index: true })
  userId: number; // To samo ID co w Postgresie (Twoje ogniwo łączące)

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: Date.now })
  lastLogin: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);