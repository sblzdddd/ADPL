import { ObjectId } from 'mongodb'
const logger = BakaLogger.child({service: 'AuthMiddleware'})

export default defineEventHandler(async (event) => {
  // Get the request URL
  const url = getRequestURL(event)
  
  // Define endpoints that require authentication for specific methods only
  const methodSpecificEndpoints = [
    { path: '/api/user', methods: ['GET', 'POST', 'PUT'] },
    { path: '/api/paint-requests', methods: ['POST', 'PUT', 'DELETE'] },
  ]
  
  // Check if this is a method-specific protected endpoint
  const requiresAuth = methodSpecificEndpoints.some(({ path, methods }) => 
    url.pathname.startsWith(path) && methods.includes(event.method || 'GET')
  )
  
  try {
    // Get current user from session
    const session = await getUserSession(event)
    // Check if session has actual user data (not just a session ID)
    // A valid session should have id, pwdHash
    if (!session || !session.user) {
      if(!requiresAuth) {
        return
      }
      logger.warn('Auth middleware: Invalid session data:', session)
      await clearUserSession(event)
      throw createError({
        statusCode: 401,
        message: 'Not authenticated'
      })
    }

    // Verify the session against the database, based on the type of auth
    let userAuth: IUser | null = null
    console.log('session', session.user.email)
    console.log('session', session.user.id)
    
    userAuth = await User.findOne({email: session.user.email, _id: ObjectId.createFromHexString(session.user.id)})

    if(!userAuth) {
      if(!requiresAuth) {
        return
      }
      logger.warn('Auth middleware: User auth not found in database')
      // clear the invalid session
      await clearUserSession(event)
      throw createError({
        statusCode: 401,
        message: 'Not authenticated'
      })
    }

    // Add user info to event context for use in API handlers
    event.context.user = {
      _id: userAuth._id,
      id: session.user.id ?? String(userAuth._id),
      email: userAuth.email,
      name: userAuth.name,
      picture: userAuth.picture,
    }
    
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    logger.error('Auth middleware error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error: ' + error
    })
  }
}) 