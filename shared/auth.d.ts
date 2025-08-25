declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    picture?: string
    googleId: string
    createdAt: Date
    updatedAt: Date
  }

  interface UserSession {
    user: User
    loggedInAt: Date
  }
}

export {}
