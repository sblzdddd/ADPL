import { PaintRequest } from '../../../models/PaintRequest';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
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
    console.error('Error joining paint request:', error);
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
