import { PaintRequest } from '../../../models/PaintRequest';
import type { PaintRequest as PaintRequestType } from '../../../models/PaintRequest';
import type { ObjectId } from 'mongoose';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const paintRequest = await PaintRequest.findById(id)
      .populate('comments.user', 'name email picture')
      .lean();

    if (!paintRequest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paint request not found'
      });
    }
    // Helper: recursively resolve replies and flatten them
    const resolveReplies = async (replyIds: (ObjectId | string)[]): Promise<Comment[]> => {
      if (!replyIds || replyIds.length === 0) return [];

      const replyComments = (await PaintRequest.aggregate([
        { $unwind: '$comments' },
        { $match: { 'comments._id': { $in: replyIds } } },
        { $replaceRoot: { newRoot: '$comments' } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            content: 1,
            createdAt: 1,
            parentComment: 1,
            replies: 1,
            user: {
              _id: '$user._id',
              name: '$user.name',
              email: '$user.email',
              picture: '$user.picture'
            }
          }
        }
      ])) as Comment[];

      const flattened: Comment[] = [];
      for (const reply of replyComments) {
        const nestedReplies = await resolveReplies(
          reply.replies as unknown as (ObjectId | string)[]
        );
        reply.replies = []; // clear nested replies
        flattened.push(reply, ...nestedReplies);
      }
      // Sort oldest → newest
      flattened.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return flattened;
    };

    // Resolve replies for top-level comments
    if (paintRequest.comments && paintRequest.comments.length > 0) {
      for (const comment of paintRequest.comments) {
        if (comment.replies && comment.replies.length > 0) {
          // @ts-expect-error - TODO: fix the type changing of replies
          comment.replies = await resolveReplies(
            comment.replies as unknown as (ObjectId | string)[]
          );
        }
      }

      // Remove reply comments from root comments list
      const allReplyIds = paintRequest.comments.flatMap((c) =>
        (c.replies as unknown as Comment[]).map((r) => r._id?.toString())
      );
      paintRequest.comments = paintRequest.comments.filter(
        (c) => !allReplyIds.includes(c._id.toString())
      );
    }

    return {
      success: true,
      data: paintRequest.comments as unknown as typeof PaintRequestType
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
