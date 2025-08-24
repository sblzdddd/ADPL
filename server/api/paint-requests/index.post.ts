import { PaintRequest } from '../../models/PaintRequest';
import { z } from 'zod';
import { uploadToFreeimage } from '../../utils/image_uploader';

const coordinatesSchema = z.object({
  TlX: z.number(),
  TlY: z.number(),
  Px: z.number(),
  Py: z.number(),
});

const createPaintRequestSchema = z.object({
  coordinates: coordinatesSchema,
  tags: z.array(z.string().trim()).default([]),
  image: z.instanceof(File),
  title: z.string().trim(),
});


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
    const imageFile = formData.get('image') as File | null;
    const coordinatesData = formData.get('coordinates');
    const tagsData = formData.get('tags');
    const title = formData.get('title');
    let coordinates, tags;
    
    try {
      coordinates = JSON.parse(coordinatesData as string);
      tags = JSON.parse(tagsData as string);
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid JSON data for coordinates or tags'
      });
    }
    
    // Validate the data using Zod
    const parsed = createPaintRequestSchema.safeParse({
      coordinates,
      tags,
      image: imageFile,
      title: title as string,
    });
    
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: parsed.error.flatten(),
      });
    }
    
    const { coordinates: validatedCoordinates, tags: validatedTags, image } = parsed.data;
    const { TlX, TlY, Px, Py } = validatedCoordinates;

    // Create the paint request
    const paintRequest = new PaintRequest({
      coordinates: { TlX, TlY, Px, Py },
      tags: validatedTags.filter(tag => tag.trim().length > 0),
      owner: user._id,
      participants: [],
      comments: [],
      title: title as string,
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
    console.error('Error creating paint request:', error);
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
