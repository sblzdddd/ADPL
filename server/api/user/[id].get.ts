import { User } from '../../models/User'

const logger = BakaLogger.child({'service': 'UserAPI'})

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID format'
      })
    }

    const user = await User.findById(userId).select('-__v')
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Don't return banned users
    if (user.banned) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    logger.info(`User profile retrieved: ${userId}`)
    
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error: unknown) {
    logger.error(`Error retrieving user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
