import { GovernancePollDocument } from '../models/governancePoll';
/**
 * T047: Governance Service
 * Handles poll creation, voting, and results
 */
export interface CreatePollRequest {
    musicianId: string;
    title: string;
    description?: string;
    options: string[];
    startTime: Date;
    endTime: Date;
}
export interface VoteRequest {
    pollId: string;
    voterAddress: string;
    votedOption: number;
    tokenAmount: number;
    txHash: string;
}
export interface PollResponse {
    pollId: string;
    musicianId: string;
    title: string;
    description?: string;
    options: string[];
    startTime: string;
    endTime: string;
    status: 'active' | 'completed' | 'cancelled';
    results: Record<string, number>;
    totalVotes: number;
    totalVotingPower: number;
    isActive: boolean;
}
declare class GovernanceService {
    /**
     * Create a new voting poll
     */
    createPoll(request: CreatePollRequest): Promise<GovernancePollDocument>;
    /**
     * Get polls for a specific musician
     */
    getMusicianPolls(musicianId: string, skip?: number, limit?: number): Promise<{
        polls: PollResponse[];
        total: number;
    }>;
    /**
     * Get active polls for a musician
     */
    getActivePollsForMusician(musicianId: string): Promise<PollResponse[]>;
    /**
     * Get poll details
     */
    getPoll(pollId: string): Promise<PollResponse | null>;
    /**
     * Cast a vote on a poll using quadratic voting
     */
    vote(request: VoteRequest): Promise<GovernancePollDocument>;
    /**
     * Get poll results
     */
    getPollResults(pollId: string): Promise<{
        pollId: string;
        title: string;
        options: string[];
        results: Array<{
            option: string;
            votes: number;
            percentage: number;
        }>;
        totalVotes: number;
        status: 'active' | 'completed' | 'cancelled';
    }>;
    /**
     * Close a poll (mark as completed)
     */
    closePoll(pollId: string): Promise<GovernancePollDocument>;
    /**
     * Validate poll request
     */
    private validatePollRequest;
    /**
     * Format poll for response
     */
    private formatPollResponse;
}
export declare const governanceService: GovernanceService;
export {};
//# sourceMappingURL=governanceService.d.ts.map