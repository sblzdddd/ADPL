import mongoose from 'mongoose';
import { PaintRequest } from '../../../models/PaintRequest';

const logger = BakaLogger.child({'service': 'CommentAPI'})

export default defineEventHandler(async (event) => {
  try {
    // Get the current user from the session
    const user = event.context.user;
    const { id } = await parseRouteParams(event, paintRequestIdParam)
    const result = await readValidatedBody(event, CommentPostRequest.safeParse)
    if (!result.success) {
      throw createError({statusCode: 400, statusMessage: result.error.message})
    }
    const { content, parentComment } = result.data


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
        comment => comment._id.toString() === parentComment.toString()
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
        comment => comment._id.toString() === parentComment.toString()
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
    if (error && typeof error === 'object' && 'statusCode' in error && 'statusMessage' in error) {
      throw error;
    }
    logger.error('CommentAPI: Server Error adding comment', {error})
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
});

defineRouteMeta({
  openAPI: {
    tags: ["Comments"],
    description: "Add a comment under a paint request",
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/CommentPostRequest' } }
      }
    },
    responses: {
      '200': {
        description: 'Successful response',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CommentListResponse' } } }
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/validationErrorSchema' } } }
      },
      '401': {
        description: 'Unauthorized',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '404': {
        description: 'Paint Request Not Found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '500': {
        description: 'Internal Server Error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      }
    }
  }
})
