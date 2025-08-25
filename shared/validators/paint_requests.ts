import { z } from "zod";
import { coordinatesSchema, imageFileSchema, objectIdSchemaCoerced } from "./common";
import { UserSchema } from "./user";

export const CreatePaintRequestRequest = z.object({
  coordinates: coordinatesSchema,
  tags: z.array(z.string().min(3).max(100).trim()).default([]).meta({
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

