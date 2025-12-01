import express, { Request, Response, Router } from 'express';
import { governanceService } from '../services/governanceService';
import { formatError, formatValidationError } from '../utils/apiErrorFormatter';
import { validateNonEmptyBodyMiddleware, sanitizeRequestMiddleware } from '../middleware/validation';

/**
 * T047: Governance API Routes
 * Handles voting polls and governance operations
 */

const router: Router = express.Router();

// Apply global middleware
router.use(sanitizeRequestMiddleware());

/**
 * POST /api/governance/polls
 * Create a new voting poll (musician only)
 *
 * Request body:
 * {
 *   "musicianId": "...",
 *   "title": "Should we do a collab with X?",
 *   "description": "Optional description",
 *   "options": ["Yes", "No", "Maybe"],
 *   "startTime": "2025-11-29T12:00:00Z",
 *   "endTime": "2025-12-06T12:00:00Z"
 * }
 */
router.post('/', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { musicianId, title, description, options, startTime, endTime } = req.body;

    // Validate required fields
    const errors: { [key: string]: string } = {};

    if (!musicianId || musicianId.trim().length === 0) {
      errors.musicianId = 'Musician ID is required';
    }

    if (!title || title.trim().length === 0) {
      errors.title = 'Poll title is required';
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      errors.options = 'Poll must have at least 2 options';
    }

    if (!startTime) {
      errors.startTime = 'Start time is required';
    }

    if (!endTime) {
      errors.endTime = 'End time is required';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(
        formatValidationError(errors, 400, req.originalUrl)
      );
    }

    // Create poll
    const poll = await governanceService.createPoll({
      musicianId: musicianId.trim(),
      title: title.trim(),
      description: description?.trim(),
      options: options.map((opt: string) => opt.trim()),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    return res.status(201).json({
      pollId: poll._id.toString(),
      musicianId: poll.musicianId.toString(),
      title: poll.title,
      description: poll.description,
      options: poll.options,
      startTime: poll.startTime.toISOString(),
      endTime: poll.endTime.toISOString(),
      status: poll.status,
      createdAt: poll.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Poll creation error:', error.message);
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

/**
 * GET /api/governance/polls/:musicianId
 * List polls for a specific musician
 *
 * Query parameters:
 * - skip: number (default: 0)
 * - limit: number (default: 20)
 */
router.get('/:musicianId', async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    let skip = parseInt(req.query.skip as string) || 0;
    let limit = parseInt(req.query.limit as string) || 20;

    if (skip < 0) skip = 0;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    const { polls, total } = await governanceService.getMusicianPolls(
      musicianId,
      skip,
      limit
    );

    return res.status(200).json({
      musicianId,
      polls,
      pagination: {
        skip,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

/**
 * POST /api/governance/polls/:pollId/vote
 * Cast a vote on a poll
 *
 * Request body:
 * {
 *   "voterAddress": "0x...",
 *   "votedOption": 0,
 *   "tokenAmount": 100,
 *   "txHash": "0x..."
 * }
 */
router.post('/:pollId/vote', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const { voterAddress, votedOption, tokenAmount, txHash } = req.body;

    // Validate required fields
    const errors: { [key: string]: string } = {};

    if (!voterAddress || typeof voterAddress !== 'string') {
      errors.voterAddress = 'Voter address is required';
    }

    if (votedOption === undefined || typeof votedOption !== 'number') {
      errors.votedOption = 'Vote option is required';
    }

    if (!tokenAmount || typeof tokenAmount !== 'number' || tokenAmount <= 0) {
      errors.tokenAmount = 'Token amount must be a positive number';
    }

    if (!txHash || typeof txHash !== 'string') {
      errors.txHash = 'Transaction hash is required';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(
        formatValidationError(errors, 400, req.originalUrl)
      );
    }

    // Cast vote
    const poll = await governanceService.vote({
      pollId,
      voterAddress: voterAddress.trim(),
      votedOption,
      tokenAmount,
      txHash: txHash.trim(),
    });

    return res.status(200).json({
      voteId: `${poll._id}-${voterAddress}`,
      pollId: poll._id.toString(),
      voterAddress,
      votedOption,
      votingPower: Math.sqrt(tokenAmount),
      status: 'recorded',
    });
  } catch (error: any) {
    console.error('Vote error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error.message, statusCode, req.originalUrl));
  }
});

/**
 * GET /api/governance/polls/:pollId/results
 * Get poll results and voting data
 */
router.get('/:pollId/results', async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;

    const results = await governanceService.getPollResults(pollId);

    return res.status(200).json(results);
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error.message, statusCode, req.originalUrl));
  }
});

export default router;
