import type { ObjectId } from 'mongodb';
import { PaintRequest } from '../../../../models/PaintRequest';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const commentId = getRouterParam(event, 'commentId');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      });
    }

    if (!commentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Comment ID is required'
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
    

    // Find the comment to delete
    const commentIndex = paintRequest.comments.findIndex(
      comment => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Comment not found'
      });
    }

    const comment = paintRequest.comments[commentIndex];

    const replies = comment.replies;
    
    function deleteReplies(replies: ObjectId[] | undefined) {
      if (!replies || !paintRequest) return;
      for (const reply of replies) {
        const replyIndex = paintRequest.comments.findIndex(
          comment => comment._id.toString() === reply.toString()
        );
        if(replyIndex === -1) {
          continue;
        }
        const replyComment = paintRequest.comments[replyIndex];
        if (replyComment.replies) {
          deleteReplies(replyComment.replies);
        }
        if (replyIndex !== -1) {
          paintRequest.comments.splice(replyIndex, 1);
        }
      }
    }
    
    if(replies && replies.length > 0) {
      deleteReplies(replies);
    }

    // Check if user owns the comment
    if (comment.user.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own comments'
      });
    }

    // Remove the comment
    paintRequest.comments.splice(commentIndex, 1);

    await paintRequest.save();

    return {
      success: true,
      message: 'Comment deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting comment:', error);
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
