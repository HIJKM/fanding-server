import mongoose, { Schema, Document } from 'mongoose';

/**
 * T047: GovernancePoll Model
 * Stores fan voting polls for musicians
 */

interface Vote {
  voterAddress: string;
  votedOption: number;
  votingPower: number;
  txHash: string;
  timestamp: Date;
}

export interface GovernancePollDocument extends Document {
  musicianId: mongoose.Types.ObjectId;
  contractPollId?: number;
  title: string;
  description?: string;
  options: string[];
  startTime: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'cancelled';
  results: Record<string, number>;
  votes: Vote[];
  totalVotingPower: number;
  createdAt: Date;
  updatedAt: Date;
}

const governancePollSchema = new Schema<GovernancePollDocument>(
  {
    musicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Musician',
      required: true,
      index: true,
    },
    contractPollId: {
      type: Number,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
    },
    options: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    results: {
      type: Map,
      of: Number,
      default: {},
    },
    votes: [
      {
        voterAddress: {
          type: String,
          required: true,
          lowercase: true,
          index: true,
        },
        votedOption: {
          type: Number,
          required: true,
        },
        votingPower: {
          type: Number,
          required: true,
        },
        txHash: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalVotingPower: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
governancePollSchema.index({ musicianId: 1, startTime: -1 });
governancePollSchema.index({ musicianId: 1, status: 1 });
governancePollSchema.index({ startTime: 1, endTime: 1 });

export const GovernancePoll = mongoose.model<GovernancePollDocument>(
  'GovernancePoll',
  governancePollSchema
);
