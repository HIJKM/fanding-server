"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.governanceService = void 0;
const governancePoll_1 = require("../models/governancePoll");
const tokenPurchase_1 = require("../models/tokenPurchase");
class GovernanceService {
    /**
     * Create a new voting poll
     */
    async createPoll(request) {
        // Validate inputs
        this.validatePollRequest(request);
        // Validate time range
        if (request.startTime >= request.endTime) {
            throw new Error('Poll start time must be before end time');
        }
        // Initialize results object
        const results = {};
        request.options.forEach((_option, index) => {
            results[index.toString()] = 0;
        });
        // Create poll
        const poll = new governancePoll_1.GovernancePoll({
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
    async getMusicianPolls(musicianId, skip = 0, limit = 20) {
        const polls = await governancePoll_1.GovernancePoll.find({
            musicianId,
        })
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await governancePoll_1.GovernancePoll.countDocuments({ musicianId });
        const pollResponses = polls.map((poll) => this.formatPollResponse(poll));
        return { polls: pollResponses, total };
    }
    /**
     * Get active polls for a musician
     */
    async getActivePollsForMusician(musicianId) {
        const now = new Date();
        const polls = await governancePoll_1.GovernancePoll.find({
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
    async getPoll(pollId) {
        const poll = await governancePoll_1.GovernancePoll.findById(pollId).exec();
        if (!poll) {
            return null;
        }
        return this.formatPollResponse(poll);
    }
    /**
     * Cast a vote on a poll using quadratic voting
     */
    async vote(request) {
        // Get poll
        const poll = await governancePoll_1.GovernancePoll.findById(request.pollId).exec();
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
        if (request.votedOption < 0 ||
            request.votedOption >= poll.options.length) {
            throw new Error('Invalid vote option');
        }
        // Verify voter is a token holder
        const purchase = await tokenPurchase_1.TokenPurchase.findOne({
            fanWalletAddress: request.voterAddress.toLowerCase(),
        }).exec();
        if (!purchase) {
            throw new Error('Only token holders can vote');
        }
        // Check if already voted
        const existingVote = poll.votes.find((v) => v.voterAddress.toLowerCase() === request.voterAddress.toLowerCase());
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
        const currentResult = poll.results.get?.(optionKey) || poll.results[optionKey] || 0;
        if (poll.results.set) {
            poll.results.set(optionKey, currentResult + votingPower);
        }
        else {
            poll.results[optionKey] = currentResult + votingPower;
        }
        // Update total voting power
        poll.totalVotingPower += votingPower;
        await poll.save();
        console.log(`✅ Vote registered: ${request.voterAddress} voted on poll ${poll._id}`);
        return poll;
    }
    /**
     * Get poll results
     */
    async getPollResults(pollId) {
        const poll = await governancePoll_1.GovernancePoll.findById(pollId).exec();
        if (!poll) {
            throw new Error('Poll not found');
        }
        const resultsArray = poll.options.map((option, index) => {
            const optionKey = index.toString();
            let votes;
            if (poll.results.get) {
                votes = poll.results.get(optionKey) || 0;
            }
            else {
                votes = poll.results[optionKey] || 0;
            }
            const percentage = poll.totalVotingPower > 0
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
    async closePoll(pollId) {
        const poll = await governancePoll_1.GovernancePoll.findById(pollId).exec();
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
    validatePollRequest(request) {
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
    formatPollResponse(poll) {
        const now = new Date();
        const isActive = poll.status === 'active' &&
            now >= poll.startTime &&
            now <= poll.endTime;
        // Format results object
        let formattedResults;
        if (poll.results.entries) {
            // If it's a Map
            formattedResults = Object.fromEntries(Array.from(poll.results.entries()).map(([key, value]) => [
                key,
                Math.round(value * 100) / 100,
            ]));
        }
        else {
            // If it's already a plain object
            formattedResults = Object.fromEntries(Object.entries(poll.results).map(([key, value]) => [
                key,
                Math.round(value * 100) / 100,
            ]));
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
exports.governanceService = new GovernanceService();
//# sourceMappingURL=governanceService.js.map