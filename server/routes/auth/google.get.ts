import { User } from '../../models/User';

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user, tokens: _tokens }) {
    try {
      console.log('Google OAuth user data:', user); // Debug log
      
      // Validate required fields
      if (!user.email || !user.name) {
        throw new Error(`Missing required user data: email=${user.email}, name=${user.name}`);
      }
      
      // Check if user already exists
      let dbUser = await User.findOne({ email: user.email });
      
      if (!dbUser) {
        // Create new user if they don't exist
        const userData = {
          email: user.email,
          name: user.name,
          picture: user.picture || undefined,
        };
        console.log('Creating user with data:', userData); // Debug log
        dbUser = await User.create(userData);
      } else {
        // Update existing user's information
        dbUser.name = user.name;
        dbUser.picture = user.picture || undefined;
        await dbUser.save();
      }

      // Set user session
      await setUserSession(event, {
        user: {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          picture: dbUser.picture || undefined,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        loggedInAt: new Date(),
      });

      return sendRedirect(event, '/');
    } catch (error) {
      console.error('Error in Google OAuth success handler:', error);
      return sendRedirect(event, '/?error=auth_failed');
    }
  },
  onError(event, error) {
    console.error('Google OAuth error:', error);
    return sendRedirect(event, '/?error=auth_failed');
  },
});
