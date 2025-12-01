import mongoose, { Document } from 'mongoose';
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
export declare const GovernancePoll: mongoose.Model<GovernancePollDocument, {}, {}, {}, mongoose.Document<unknown, {}, GovernancePollDocument, {}, mongoose.DefaultSchemaOptions> & GovernancePollDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, GovernancePollDocument>;
export {};
//# sourceMappingURL=governancePoll.d.ts.map