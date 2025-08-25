import { PaintRequest } from '../../../models/PaintRequest';
import { coordinatesSchema } from '../../../../shared/validators/common';
import { z } from 'zod';

const logger = BakaLogger.child({'service': 'PaintRequestUpdateAPI'});

export default defineEventHandler(async (event) => {
  try {
    // Get paint request ID from URL params
    const params = await parseRouteParams(event, paintRequestIdParam);
    const paintRequestId = params.id;
    const user = event.context.user;

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
        message: 'Only the owner can modify this paint request'
      });
    }

    // Parse and validate request body
    const formData = await readFormData(event);
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'No form data provided'
      });
    }

    // Convert form data to structured object
    const updateData: Partial<IPaintRequest> = {};
    let imageFile: File | null = null;

    // Extract all form fields at once
    const coordinates = formData.get('coordinates');
    const tags = formData.get('tags');
    const title = formData.get('title');
    const image = formData.get('image') as File | null;

    // Store all data into updateData (can be undefined)
    if (coordinates) {
      try {
        updateData.coordinates = JSON.parse(coordinates.toString());
      } catch (error) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid coordinates format: ' + error
        });
      }
    }

    if (tags) {
      try {
        updateData.tags = JSON.parse(tags.toString());
      } catch (error) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid tags format: ' + error
        });
      }
    }

    if (title) {
      updateData.title = title.toString();
    }

    if (image) {
      imageFile = image;
    }

    // Validate update data (only validate fields that are provided)
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'At least one field must be provided for update'
      });
    }

    // Validate all fields at once using a single validation schema
    const updateValidationSchema = z.object({
      coordinates: coordinates ? coordinatesSchema : z.undefined(),
      tags: tags ? z.array(z.string().min(1).max(100).trim()) : z.undefined(),
      title: title ? z.string().min(1).max(100).trim() : z.undefined(),
    }).partial();

    console.log(1)

    const validationResult = updateValidationSchema.safeParse(updateData);
    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Validation failed',
        data: validationResult.error.issues
      });
    }

    // Handle image upload if provided
    if (imageFile) {
      const imageValidation = imageFileSchema("Image File", 2 * 1024 * 1024).safeParse(updateData.image);
      if (!imageValidation.success) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid image format',
          data: imageValidation.error.issues
        });
      }
      const { uploadToFreeimage } = await import('../../../utils/image_uploader');
      try {
        const imageData = await uploadToFreeimage(imageFile);
        updateData.image = imageData;
      } catch (uploadError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Failed to upload image: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error')
        });
      }
    }

    // Update the paint request
    const updatedPaintRequest = await PaintRequest.findByIdAndUpdate(
      paintRequestId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('owner', 'name email picture');

    if (!updatedPaintRequest) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to update paint request'
      });
    }

    // Prepare response data
    const responseData = {
      _id: updatedPaintRequest._id.toString(),
      title: updatedPaintRequest.title,
      tags: updatedPaintRequest.tags,
      coordinates: updatedPaintRequest.coordinates,
      owner: updatedPaintRequest.owner,
      image: updatedPaintRequest.image,
      updatedAt: updatedPaintRequest.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: responseData,
      message: 'Paint request updated successfully'
    };

  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && 'statusMessage' in error) {
      throw error;
    }
    
    logger.error('PaintRequestUpdateAPI: Server Error updating paint request', { error });
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
    description: "Update a paint request (partial update supported)",
    parameters: [
      { in: "path", name: "id", required: true, schema: { type: 'string', format: 'ObjectId' } }
    ],
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: { $ref: '#/components/schemas/UpdatePaintRequestRequest' }
        }
      }
    },
    responses: {
      '200': {
        description: 'Paint request updated successfully',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePaintRequestResponse' } } }
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/validationErrorSchema' } } }
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
