import { PaintRequest } from '../../models/PaintRequest';
import { uploadToFreeimage } from '../../utils/image_uploader';

const logger = BakaLogger.child({'service': 'PaintRequestAPI'})

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }
    // Handle multipart form data
    const formData = await readFormData(event);
    
    // Extract file and form fields
    const data = {
      image: formData.get('image') as File | null,
      coordinates: JSON.parse(formData.get('coordinates') as string),
      title: formData.get('title') as string,
    }
    
    // Validate the data using Zod
    const parsed = CreatePaintRequestRequest.safeParse(data);
    
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: parsed.error.flatten(),
      });
    }
    
    const { coordinates, image, title } = parsed.data;

    // Create the paint request
    const paintRequest = new PaintRequest({
      coordinates,
      owner: user._id,
      participants: [],
      comments: [],
      title,
      image: {
        url: '',
        size: 0,
      },
    });

    try {
      const imageData = await uploadToFreeimage(image);
      paintRequest.image = imageData;
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to upload image'
      });
    }

    await paintRequest.save();

    // Populate owner info
    await paintRequest.populate('owner', 'name email picture');

    return {
      success: true,
      data: paintRequest,
      message: 'Paint request created successfully'
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && 'statusMessage' in error) {
      throw error;
    }
    logger.error('PaintRequestAPI: Server Error creating paint request', {error})
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
    description: "Create a new paint request",
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: { $ref: '#/components/schemas/CreatePaintRequestRequest' }
        }
      }
    },
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
      '500': {
        description: 'Internal server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      }
    }
  }
})
