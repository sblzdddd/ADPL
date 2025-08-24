import { PaintRequest } from '../../../models/PaintRequest';
import type { ObjectId } from 'mongoose';
import type { IUser } from '../../../models/User';
import type { IComment } from '../../../models/PaintRequest';

interface PaintRequestWithComments {
  _id: ObjectId | string;
  owner: IUser;
  participants: IUser[];
  comments: IComment[];
  commentsCount: number;
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      });
    }

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
        comments: null,
        commentsCount: paintRequest.comments.length,
      }
    };
  } catch (error: unknown) {
    console.error('Error fetching paint request:', error);
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'statusMessage' in error
    ) {
      throw createError({
        statusCode: (error as unknown as { statusCode: number }).statusCode,
        statusMessage: (error as unknown as { statusMessage: string }).statusMessage
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
