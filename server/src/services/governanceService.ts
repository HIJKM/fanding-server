import { GovernancePoll, GovernancePollDocument } from '../models/governancePoll';
import { TokenPurchase } from '../models/tokenPurchase';

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

class GovernanceService {
  /**
   * Create a new voting poll
   */
  async createPoll(request: CreatePollRequest): Promise<GovernancePollDocument> {
    // Validate inputs
    this.validatePollRequest(request);

    // Validate time range
    if (request.startTime >= request.endTime) {
      throw new Error('Poll start time must be before end time');
    }

    // Initialize results object
    const results: Record<string, number> = {};
    request.options.forEach((_option, index) => {
      results[index.toString()] = 0;
    });

    // Create poll
    const poll = new GovernancePoll({
      musicianId: request.musicianId,
      title: request.title,
      description: request.description,
      options: request.options,
      startTime: request.startTime,
      endTime: request.endTime,
      status: 'active',
      results,
      votes: [],
      totalVotingPower: 0,
    });

    await poll.save();

    console.log(`✅ Poll created: ${poll._id.toString()}`);
    return poll;
  }

  /**
   * Get polls for a specific musician
   */
  async getMusicianPolls(
    musicianId: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<{ polls: PollResponse[]; total: number }> {
    const polls = await GovernancePoll.find({
      musicianId,
    })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await GovernancePoll.countDocuments({ musicianId });

    const pollResponses = polls.map((poll) => this.formatPollResponse(poll));

    return { polls: pollResponses, total };
  }

  /**
   * Get active polls for a musician
   */
  async getActivePollsForMusician(musicianId: string): Promise<PollResponse[]> {
    const now = new Date();

    const polls = await GovernancePoll.find({
      musicianId,
      startTime: { $lte: now },
      endTime: { $gte: now },
      status: 'active',
    }).exec();

    return polls.map((poll) => this.formatPollResponse(poll));
  }

  /**
   * Get poll details
   */
  async getPoll(pollId: string): Promise<PollResponse | null> {
    const poll = await GovernancePoll.findById(pollId).exec();

    if (!poll) {
      return null;
    }

    return this.formatPollResponse(poll);
  }

  /**
   * Cast a vote on a poll using quadratic voting
   */
  async vote(request: VoteRequest): Promise<GovernancePollDocument> {
    // Get poll
    const poll = await GovernancePoll.findById(request.pollId).exec();
    if (!poll) {
      throw new Error('Poll not found');
    }

    // Validate poll is active
    const now = new Date();
    if (poll.status !== 'active') {
      throw new Error('Poll is not active');
    }
    if (now < poll.startTime || now > poll.endTime) {
      throw new Error('Poll voting period has ended');
    }

    // Validate option
    if (
      request.votedOption < 0 ||
      request.votedOption >= poll.options.length
    ) {
      throw new Error('Invalid vote option');
    }

    // Verify voter is a token holder
    const purchase = await TokenPurchase.findOne({
      fanWalletAddress: request.voterAddress.toLowerCase(),
    }).exec();

    if (!purchase) {
      throw new Error('Only token holders can vote');
    }

    // Check if already voted
    const existingVote = poll.votes.find(
      (v) => v.voterAddress.toLowerCase() === request.voterAddress.toLowerCase()
    );
    if (existingVote) {
      throw new Error('Voter has already voted on this poll');
    }

    // Calculate voting power using quadratic voting
    // Voting power = sqrt(token_amount)
    const votingPower = Math.sqrt(request.tokenAmount);

    // Add vote
    poll.votes.push({
      voterAddress: request.voterAddress.toLowerCase(),
      votedOption: request.votedOption,
      votingPower,
      txHash: request.txHash,
      timestamp: new Date(),
    });

    // Update results
    const optionKey = request.votedOption.toString();
    const currentResult = (poll.results as any).get?.(optionKey) || (poll.results as Record<string, number>)[optionKey] || 0;

    if ((poll.results as any).set) {
      (poll.results as any).set(optionKey, currentResult + votingPower);
    } else {
      (poll.results as Record<string, number>)[optionKey] = currentResult + votingPower;
    }

    // Update total voting power
    poll.totalVotingPower += votingPower;

    await poll.save();

    console.log(
      `✅ Vote registered: ${request.voterAddress} voted on poll ${poll._id}`
    );
    return poll;
  }

  /**
   * Get poll results
   */
  async getPollResults(pollId: string): Promise<{
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
  }> {
    const poll = await GovernancePoll.findById(pollId).exec();
    if (!poll) {
      throw new Error('Poll not found');
    }

    const resultsArray = poll.options.map((option, index) => {
      const optionKey = index.toString();
      let votes: number;

      if ((poll.results as any).get) {
        votes = (poll.results as any).get(optionKey) || 0;
      } else {
        votes = (poll.results as Record<string, number>)[optionKey] || 0;
      }

      const percentage =
        poll.totalVotingPower > 0
          ? ((votes / poll.totalVotingPower) * 100).toFixed(2)
          : '0.00';

      return {
        option,
        votes: Math.round(votes * 100) / 100, // Round to 2 decimals
        percentage: parseFloat(percentage),
      };
    });

    return {
      pollId: poll._id.toString(),
      title: poll.title,
      options: poll.options,
      results: resultsArray,
      totalVotes: poll.votes.length,
      status: poll.status,
    };
  }

  /**
   * Close a poll (mark as completed)
   */
  async closePoll(pollId: string): Promise<GovernancePollDocument> {
    const poll = await GovernancePoll.findById(pollId).exec();
    if (!poll) {
      throw new Error('Poll not found');
    }

    poll.status = 'completed';
    await poll.save();

    console.log(`✅ Poll closed: ${pollId}`);
    return poll;
  }

  /**
   * Validate poll request
   */
  private validatePollRequest(request: CreatePollRequest): void {
    if (!request.musicianId || request.musicianId.trim().length === 0) {
      throw new Error('Musician ID is required');
    }

    if (!request.title || request.title.trim().length === 0) {
      throw new Error('Poll title is required');
    }

    if (!request.options || request.options.length < 2) {
      throw new Error('Poll must have at least 2 options');
    }

    if (request.options.length > 10) {
      throw new Error('Poll cannot have more than 10 options');
    }

    request.options.forEach((option) => {
      if (!option || option.trim().length === 0) {
        throw new Error('Poll options cannot be empty');
      }
    });
  }

  /**
   * Format poll for response
   */
  private formatPollResponse(poll: GovernancePollDocument): PollResponse {
    const now = new Date();
    const isActive =
      poll.status === 'active' &&
      now >= poll.startTime &&
      now <= poll.endTime;

    // Format results object
    let formattedResults: Record<string, number>;
    if ((poll.results as any).entries) {
      // If it's a Map
      formattedResults = Object.fromEntries(
        Array.from((poll.results as any).entries() as Array<[string, number]>).map(([key, value]) => [
          key,
          Math.round(value * 100) / 100,
        ])
      );
    } else {
      // If it's already a plain object
      formattedResults = Object.fromEntries(
        Object.entries(poll.results as Record<string, number>).map(([key, value]) => [
          key,
          Math.round(value * 100) / 100,
        ])
      );
    }

    return {
      pollId: poll._id.toString(),
      musicianId: poll.musicianId.toString(),
      title: poll.title,
      description: poll.description,
      options: poll.options,
      startTime: poll.startTime.toISOString(),
      endTime: poll.endTime.toISOString(),
      status: poll.status,
      results: formattedResults,
      totalVotes: poll.votes.length,
      totalVotingPower: Math.round(poll.totalVotingPower * 100) / 100,
      isActive,
    };
  }
}

export const governanceService = new GovernanceService();
