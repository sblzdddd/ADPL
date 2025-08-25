import { User } from '../../models/User'

const logger = BakaLogger.child({'service': 'UserAPI'})

export default defineEventHandler(async (event) => {
  try {
    const { id: userId } = await parseRouteParams(event, paintRequestIdParam)
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

defineRouteMeta({
  
  openAPI: {
    tags: ["User"],
    description: "Get a user's profile",
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'The ID of the user to get the profile of'
      }
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UserSchema' } } }
      },
      '401': {
        description: 'Not authenticated',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/generalErrorSchema' } } }
      },
      '400': {
        description: 'Bad Request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/validationErrorSchema' } } }
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
