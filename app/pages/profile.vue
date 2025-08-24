<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="p-6">
      <AuthState v-slot="{ loggedIn, user, clear }">
        <div v-if="!loggedIn" class="text-center py-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile.</p>
          <Button size="lg" @click="openInPopup('/auth/google')">
            <Icon name="lucide:log-in" size="20" class="mr-2" />
            Login with Google
          </Button>
        </div>
        
        <div v-else class="space-y-6">
          <div class="flex items-center space-x-4">
            <img 
              v-if="user?.picture" 
              :src="user.picture" 
              :alt="user.name"
              class="h-14 w-14 rounded-full border-2 border-blue-100 dark:border-blue-900"
            >
            <div class="flex-1">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ user?.name }}</h1>
              <p class="text-lg text-gray-600 dark:text-gray-400">{{ user?.email }}</p>
            </div>
          </div>
          
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Information</h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>User ID:</strong> {{ user?.id }}</p>
              <p><strong>Member since:</strong> {{ formatDate(user?.createdAt) }}</p>
              <p><strong>Logged in at:</strong> {{ formatDate(session?.loggedInAt) }}</p>
            </div>
          </div>
          
          <div class="flex justify-start space-x-4 pt-4">
            <Button variant="ghost" @click="clear">
              <Icon name="lucide:log-out" size="16" class="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </AuthState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { openInPopup, session } = useUserSession()

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 
