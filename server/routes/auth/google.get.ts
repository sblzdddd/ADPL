import { User } from '../../models/User';
import { uploadToFreeimage } from '../../utils/image_uploader';

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
      
      let pictureUrl: string | undefined;
      
      // If user has a picture, download and upload it to FreeImage.host
      if (user.picture && (!dbUser || (dbUser && !dbUser.picture))) {
        try {
          console.log('Downloading user profile picture from Google...');
          
          // Download the image from Google
          const response = await fetch(user.picture);
          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status}`);
          }
          
          const imageBuffer = await response.arrayBuffer();
          const imageBlob = new Blob([imageBuffer]);
          
          // Create a File object from the blob
          const imageFile = new File([imageBlob], 'profile-picture.jpg', {
            type: 'image/jpeg'
          });
          
          // Upload to FreeImage.host
          console.log('Uploading profile picture to FreeImage.host...');
          const uploadResult = await uploadToFreeimage(imageFile);
          pictureUrl = uploadResult.url;
          
          console.log('Profile picture uploaded successfully:', pictureUrl);
        } catch (uploadError) {
          console.error('Failed to upload profile picture:', uploadError);
          // Continue without the picture if upload fails
          pictureUrl = undefined;
        }
      }
      
      if (!dbUser) {
        // Create new user if they don't exist
        const userData = {
          email: user.email,
          name: user.name,
          picture: pictureUrl,
        };
        console.log('Creating user with data:', userData); // Debug log
        dbUser = await User.create(userData);
      } else if (pictureUrl) {
        dbUser.picture = pictureUrl;
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

defineRouteMeta({
  openAPI: {
    tags: ["Auth"],
    description: "Google OAuth Login / Callback",
  },
});
