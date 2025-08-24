# ADPL - Nuxt Application

A Nuxt application with Google OAuth authentication and MongoDB integration.

## Features

- Google OAuth authentication using nuxt-auth-utils
- MongoDB integration with Mongoose
- User session management
- Modern UI with Tailwind CSS and shadcn/ui components
- Image hosting integration with freeimage.host

## OAuth Setup

### Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an "OAuth 2.0 Client ID"
5. Set the authorized redirect URI to: `http://localhost:3000/auth/google` (for development)
6. Copy the Client ID and Client Secret

### Freeimage.host Integration

The application uses [freeimage.host](https://freeimage.host/page/api) for image hosting. To set this up:

1. Visit [freeimage.host](https://freeimage.host/page/api)
2. Create an account and get your API key
3. Add the API key to your environment variables

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Google OAuth Configuration
NUXT_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id_here
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Session Configuration (optional - will be auto-generated in development)
NUXT_SESSION_PASSWORD=your_session_password_here_min_32_chars

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/adpl

# Freeimage.host API Key
FREEIMAGE_API_KEY=your_freeimage_api_key_here
```

### MongoDB Setup

1. Install and start MongoDB locally or use MongoDB Atlas
2. The application will automatically create the necessary collections and indexes
3. Users will be stored in the `users` collection with their Google profile information

## Setup

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
