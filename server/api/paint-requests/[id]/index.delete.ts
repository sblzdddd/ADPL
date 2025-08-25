import { PaintRequest } from '../../../models/PaintRequest';

const logger = BakaLogger.child({'service': 'PaintRequestDeleteAPI'});

export default defineEventHandler(async (event) => {
  try {
    // Get paint request ID from URL params
    const params = await parseRouteParams(event, paintRequestIdParam);
    const paintRequestId = params.id;

    // Get current user from context (set by auth middleware)
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Find the paint request
    const paintRequest = await PaintRequest.findById(paintRequestId)
      .populate('owner', 'name email picture')
      .lean();

    if (!paintRequest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Paint request not found'
      });
    }

    // Check if user is the owner
    if (paintRequest.owner._id.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Only the owner can delete this paint request'
      });
    }

    // Delete the paint request
    const deletedPaintRequest = await PaintRequest.findByIdAndDelete(paintRequestId);

    if (!deletedPaintRequest) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to delete paint request'
      });
    }

    // TODO: Clean up associated resources (images, comments, etc.)
    // This could include:
    // - Deleting image files from storage
    // - Deleting associated comments
    // - Removing from user's paint requests lists

    logger.info('PaintRequestDeleteAPI: Paint request deleted successfully', {
      paintRequestId: paintRequestId.toString(),
      deletedBy: user._id
    });

    return {
      success: true,
      message: 'Paint request deleted successfully'
    };

  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && 'statusMessage' in error) {
      throw error;
    }
    
    logger.error('PaintRequestDeleteAPI: Server Error deleting paint request', { error });
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

defineRouteMeta({
  openAPI: {
    tags: ["Paint Requests"],
    description: "Delete a paint request",
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: 'string', format: 'ObjectId' } }
    ],
    responses: {
      '200': {
        description: 'Paint request deleted successfully',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/DeletePaintRequestResponse' } } }
      },
      '401': {
        description: 'Not authenticated',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '403': {
        description: 'Forbidden - not the owner',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '404': {
        description: 'Paint request not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '500': {
        description: 'Internal server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      }
    }
  }
});
