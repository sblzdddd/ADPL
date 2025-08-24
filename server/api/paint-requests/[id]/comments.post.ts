import mongoose from 'mongoose';
import { PaintRequest } from '../../../models/PaintRequest';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const { content, parentComment } = body;
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Comment content is required'
      });
    }

    // Get the current user from the session
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    const paintRequest = await PaintRequest.findById(id);
    if (!paintRequest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paint request not found'
      });
    }

    // If this is a reply, validate the parent comment exists
    if (parentComment) {
      const parentCommentExists = paintRequest.comments.find(
        comment => comment._id.toString() === parentComment
      );
      if (!parentCommentExists) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Parent comment not found'
        });
      }
    }

    // Create the new comment
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      content: content.trim(),
      createdAt: new Date(),
      parentComment: parentComment || undefined,
      replies: []
    };

    // Add the comment
    paintRequest.comments.push(newComment);

    // If this is a reply, add it to the parent comment's replies array
    if (parentComment) {
      const parentCommentIndex = paintRequest.comments.findIndex(
        comment => comment._id.toString() === parentComment
      );
      if (parentCommentIndex !== -1) {
        if (!paintRequest.comments[parentCommentIndex].replies) {
          paintRequest.comments[parentCommentIndex].replies = [];
        }
        paintRequest.comments[parentCommentIndex].replies!.push(newComment._id);
      }
    }

    await paintRequest.save();

    // Populate the new comment with user info
    await paintRequest.populate('comments.user', 'name email picture');

    return {
      success: true,
      data: paintRequest.comments[paintRequest.comments.length - 1],
      message: 'Comment added successfully'
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    if(error instanceof Error && 'statusCode' in error && 'statusMessage' in error) {
      throw createError({
        statusCode: error.statusCode as number,
        statusMessage: error.statusMessage as string
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
