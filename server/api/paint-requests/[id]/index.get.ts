import { PaintRequest } from '../../../models/PaintRequest';
import type { ObjectId } from 'mongoose';
import type { IUser } from '../../../models/User';
import type { IComment } from '../../../models/PaintRequest';

const logger = BakaLogger.child({'service': 'PaintRequestAPI'})

interface PaintRequestWithComments {
  _id: ObjectId | string;
  owner: IUser;
  participants: IUser[];
  comments: IComment[];
  commentsCount: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await parseRouteParams(event, paintRequestIdParam)

    const paintRequest = (await PaintRequest.findById(id)
      .populate('owner', 'name email picture')
      .populate('participants', 'name email picture')
      .populate('comments.user', 'name email picture')
      .lean()) as PaintRequestWithComments | null;

    if (!paintRequest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paint request not found'
      });
    }

    return {
      success: true,
      data: {
        ...paintRequest,
        comments: undefined,
        commentsCount: paintRequest.comments.length,
      }
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && 'statusMessage' in error) {
      throw error;
    }
    logger.error('PlaylistAPI: Server Error getting playlist data', {error})
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
    description: "Get the paint request detail by ID",
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: 'string' } }
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/PaintRequestDetailResponse' } } }
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/validationErrorSchema' } } }
      },
      '401': {
        description: 'Not authenticated',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '404': {
        description: 'Not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '500': {
        description: 'Internal server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      }
    }
  }
})
