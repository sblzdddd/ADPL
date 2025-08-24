import type { FilterQuery } from 'mongoose';
import { PaintRequest, type IPaintRequest } from '../../models/PaintRequest';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const tags = query.tags ? (query.tags as string).split(',') : [];
    const owner = query.owner as string;

    const filter: FilterQuery<IPaintRequest> = {};
    
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }
    
    if (owner) {
      filter.owner = owner;
    }

    const skip = (page - 1) * limit;

    const [paintRequests, total] = await Promise.all([
      PaintRequest.find(filter)
        .populate('owner', 'name email picture')
        .populate('participants', 'name email picture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaintRequest.countDocuments(filter)
    ]);

    return {
      success: true,
      data: paintRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching paint requests:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
