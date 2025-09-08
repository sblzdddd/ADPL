import type { FilterQuery } from 'mongoose';
import { PaintRequest, type IPaintRequest } from '../../models/PaintRequest';

const logger = BakaLogger.child({'service': 'PaintRequestAPI'})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const owner = query.owner as string;

    const filter: FilterQuery<IPaintRequest> = {};
    
    if (owner) {
      filter.owner = owner;
    }

    const skip = (page - 1) * limit;

    const [paintRequests, total] = await Promise.all([
      PaintRequest.find(filter)
        .populate('owner', 'name email picture')
        .populate('participants', 'name email picture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaintRequest.countDocuments(filter)
    ]);

    return {
      success: true,
      data: paintRequests.map(request => ({
        ...request,
        commentsCount: request.comments?.length || 0,
        comments: null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && 'statusMessage' in error) {
      throw error;
    }
    logger.error('PaintRequestAPI: Server Error fetching paint requests', {error})
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
});



defineRouteMeta({
  openAPI: {
    tags: ["Paint Requests"],
    description: "Get a list of all paint requests",
    parameters: [
      { in: "query", name: "page", required: false, schema: { type: 'number', default: 1 } },
      { in: "query", name: "limit", required: false, schema: { type: 'number', default: 20 } },
      { in: "query", name: "owner", required: false, schema: { type: 'string', default: '' } }
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/PaintRequestListResponse' } } }
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/validationErrorSchema' } } }
      },
      '401': {
        description: 'Not authenticated',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '500': {
        description: 'Internal server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      }
    }
  }
})
