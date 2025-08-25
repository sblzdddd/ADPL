import { z } from "zod";
import { coordinatesSchema, imageFileSchema, objectIdSchemaCoerced } from "./common";
import { UserSchema } from "./user";

export const CreatePaintRequestRequest = z.object({
  coordinates: coordinatesSchema,
  tags: z.array(z.string().min(1).max(100).trim()).default([]).meta({
    description: 'Tags for the paint request',
    example: ['tag1', 'tag2'],
  }),
  image: imageFileSchema('Template Image').meta({
    description: 'Blue Marble Template Image for the paint request',
    example: '[no example]',
  }),
  title: z.string().min(3).max(100).trim().meta({
    description: 'Title for the paint request',
    example: 'Paint request title',
  }),
});

export const ImageTemplateSchema = z.object({
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  mediumUrl: z.string().optional(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  originalFilename: z.string().optional(),
})

export const PaintRequestDetailResponse = z.object({
  data: z.object({
    _id: z.string(),
    title: z.string(),
    tags: z.array(z.string()),
    coordinates: coordinatesSchema,
    owner: UserSchema,
    image: ImageTemplateSchema,
  })
})

export const PaintRequestJoinResponse = z.object({
  success: z.boolean(),
  data: PaintRequestDetailResponse,
  message: z.string(),
});

export const PaintRequestListResponse = z.object({
  data: z.array(PaintRequestDetailResponse),
});


export const paintRequestIdParams = z.object({
  id: objectIdSchemaCoerced("Paint Request ID")
});

export const paintRequestIdParam = paintRequestIdParams.pick({ id: true }).meta({
  description: 'Paint Request ID',
  param: { in: 'path', name: 'id', required: true },
});

// Update Paint Request Request Schema (supports partial updates)
export const UpdatePaintRequestRequest = z.object({
  coordinates: coordinatesSchema.optional().meta({
    description: 'Coordinates for the paint request',
    example: { TlX: 0, TlY: 0, Px: 100, Py: 100 },
  }),
  tags: z.array(z.string().min(1).max(100).trim()).optional().meta({
    description: 'Tags for the paint request',
    example: ['tag1', 'tag2'],
  }),
  image: imageFileSchema('Template Image').optional().meta({
    description: 'Blue Marble Template Image for the paint request',
    example: '[no example]',
  }),
  title: z.string().min(3).max(100).trim().optional().meta({
    description: 'Title for the paint request',
    example: 'Updated paint request title',
  }),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
  path: ['update'],
});

// Update Paint Request Response Schema
export const UpdatePaintRequestResponse = z.object({
  success: z.boolean().meta({
    description: 'Whether the update was successful',
    example: true,
  }),
  data: z.object({
    _id: z.string().meta({
      description: 'Paint Request ID',
      example: '6863722013b04be86cb7a555',
    }),
    title: z.string().meta({
      description: 'Updated title',
      example: 'Updated paint request title',
    }),
    tags: z.array(z.string()).meta({
      description: 'Updated tags',
      example: ['tag1', 'tag2'],
    }),
    coordinates: coordinatesSchema.meta({
      description: 'Updated coordinates',
      example: { TlX: 0, TlY: 0, Px: 100, Py: 100 },
    }),
    owner: UserSchema.meta({
      description: 'Owner of the paint request',
      example: UserSchema,
    }),
    image: ImageTemplateSchema.meta({
      description: 'Updated image template',
      example: ImageTemplateSchema,
    }),
    updatedAt: z.string().meta({
      description: 'Last update timestamp',
      example: '2021-01-01T00:00:00.000Z',
    }),
  }).meta({
    description: 'Updated paint request data',
  }),
  message: z.string().meta({
    description: 'Success message',
    example: 'Paint request updated successfully',
  }),
});

// Delete Paint Request Response Schema
export const DeletePaintRequestResponse = z.object({
  success: z.boolean().meta({
    description: 'Whether the deletion was successful',
    example: true,
  }),
  message: z.string().meta({
    description: 'Success message',
    example: 'Paint request deleted successfully',
  }),
});

