import { PaintRequest } from '../../../models/PaintRequest';

const logger = BakaLogger.child({'service': 'PaintRequestAPI'})

export default defineEventHandler(async (event) => {
  try {
    const { id } = await parseRouteParams(event, paintRequestIdParam)
    const user = event.context.user;

    const paintRequest = await PaintRequest.findById(id);
    if (!paintRequest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paint request not found'
      });
    }

    // Check if user is already the owner
    if (paintRequest.owner.toString() === user._id.toString()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot join your own request'
      });
    }

    // Check if user is already a participant
    if (paintRequest.participants.includes(user._id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Already a participant'
      });
    }

    // Add user to participants
    paintRequest.participants.push(user._id);
    await paintRequest.save();

    // Populate the updated request
    await paintRequest.populate('owner', 'name email picture');
    await paintRequest.populate('participants', 'name email picture');

    return {
      success: true,
      data: paintRequest,
      message: 'Successfully joined the paint request'
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
    description: "Join a paint request",
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: 'string' } }
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/PaintRequestJoinResponse' } } }
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
