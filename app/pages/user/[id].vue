<template>
  <div class="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
    <div class="p-6">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
        <p class="mt-2">Loading profile...</p>
      </div>
      
      <div v-else-if="error" class="text-center py-8">
        <Icon name="mdi:alert-circle" size="48" class="mx-auto mb-2 text-destructive" />
        <p class="mb-2">{{ error }}</p>
        <Button @click="fetchUserProfile">
          Try Again
        </Button>
      </div>
      
      <div v-else-if="profileUser" class="space-y-6">
        <div class="flex items-center space-x-4">
          <img 
            v-if="profileUser.picture" 
            :src="profileUser.picture" 
            :alt="profileUser.name"
            class="h-10 w-10 rounded-full border-2 border-blue-100 dark:border-blue-900"
          >
          <div class="flex-1">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ profileUser.name }}</h1>
          </div>
        </div>
        
        <div class="p-0">
          <h3 class="text-lg font-semibold mb-2">Account Information</h3>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>User ID:</strong> {{ profileUser._id }}</p>
            <p><strong>Member since:</strong> {{ formatDate(profileUser.createdAt) }}</p>
            <p v-if="isOwnProfile"><strong>Logged in at:</strong> {{ formatDate(session?.loggedInAt) }}</p>
          </div>
        </div>

        <div class="p-0">
          <h3 class="text-lg font-semibold mb-2">Request Posts</h3>
          
          <!-- Loading State for Paint Requests -->
          <div v-if="paintRequestsLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"/>
            <p class="mt-2 text-gray-600">Loading paint requests...</p>
          </div>

          <!-- Error State for Paint Requests -->
          <div v-else-if="paintRequestsError" class="text-center py-8">
            <Icon name="mdi:alert-circle" size="32" class="mx-auto mb-2 text-destructive" />
            <p class="text-gray-600">{{ paintRequestsError }}</p>
            <Button size="sm" @click="fetchPaintRequests">
              Try Again
            </Button>
          </div>

          <!-- Paint Requests Grid -->
          <div v-else-if="paintRequests.data.value && paintRequests.data.value.data.length > 0" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <PaintRequestCard
                v-for="request in paintRequests.data.value.data as PaintRequest[]"
                :key="request._id"
                :request="request"
                :hide-user="true"
              />
            </div>

            <!-- Pagination -->
            <div v-if="paintRequests.data.value.pagination.pages > 1" class="flex items-center justify-center gap-2">
              <Button
                :disabled="currentPage <= 1"
                size="sm"
                @click="changePage(currentPage - 1)"
              >
                Previous
              </Button>
              
              <span class="px-3 py-2 text-gray-700 text-sm">
                Page {{ currentPage }} of {{ paintRequests.data.value.pagination.pages }}
              </span>
              
              <Button
                :disabled="currentPage >= paintRequests.data.value.pagination.pages"
                size="sm"
                @click="changePage(currentPage + 1)"
              >
                Next
              </Button>
            </div>
          </div>

          <!-- Empty State for Paint Requests -->
          <div v-else class="text-center py-8">
            <Icon name="mdi:image-search" size="32" class="mx-auto mb-2 text-gray-400" />
            <p class="text-gray-600">No paint requests found</p>
            <p class="text-gray-500 text-sm mt-1">This user hasn't created any paint requests yet</p>
          </div>
        </div>
        
        <!-- Only show logout button if viewing own profile -->
        <AuthState v-slot="{ clear }">
          <div v-if="isOwnProfile" class="flex justify-start space-x-4 pt-4">
            <Button variant="ghost" @click="clear">
              <Icon name="lucide:log-out" size="16" class="mr-2" />
              Logout
            </Button>
          </div>
        </AuthState>
      </div>
      
      <div v-else class="text-center py-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">The requested user profile could not be found.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import PaintRequestCard from '~/components/PaintRequestCard.vue'

const route = useRoute()
const { session, loggedIn, user } = useUserSession()

const loading = ref(false)
const error = ref('')
const profileUser = ref<{
  _id: string
  email: string
  name: string
  picture?: string
  createdAt: string | Date
  updatedAt: string | Date
} | null>(null)

const userId = route.params.id as string

// Paint requests state
const paintRequestsLoading = ref(false)
const paintRequestsError = ref('')
const currentPage = ref(1)

// Check if the current user is viewing their own profile
const isOwnProfile = computed(() => {
  return loggedIn.value && user.value && user.value.id === userId
})

// Fetch user profile data
const fetchUserProfile = async () => {
  if (!userId) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<{
      _id: string
      email: string
      name: string
      picture?: string
      createdAt: string | Date
      updatedAt: string | Date
    }>(`/api/user/${userId}`)
    profileUser.value = response
  } catch (err: unknown) {
    const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data 
      ? String(err.data.message) 
      : 'Failed to load user profile'
    error.value = errorMessage
    console.error('Error fetching user profile:', err)
  } finally {
    loading.value = false
  }
}

// Fetch paint requests for the user
const fetchPaintRequests = async () => {
  if (!userId) return
  
  paintRequestsLoading.value = true
  paintRequestsError.value = ''
  
  try {
    await useFetch('/api/paint-requests', {
      method: 'GET',
      key: `user-paint-requests-${userId}`,
      query: {
        page: currentPage.value,
        limit: 12,
        owner: userId
      }
    })
  } catch (err) {
    console.error('Error fetching paint requests:', err)
    paintRequestsError.value = 'Failed to load paint requests. Please try again.'
  } finally {
    paintRequestsLoading.value = false
  }
}

// Change page for paint requests
const changePage = (newPage: number) => {
  if (newPage >= 1 && paintRequests.data.value && newPage <= paintRequests.data.value.pagination.pages) {
    currentPage.value = newPage
    fetchPaintRequests()
  }
}

// Use NuxtData for paint requests with user-specific key
const paintRequests = useNuxtData<InternalApi['/api/paint-requests']['get']>(`user-paint-requests-${userId}`)

// Fetch data on page load
onMounted(() => {
  fetchUserProfile()
  fetchPaintRequests()
})

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

useHead({
  title: `User Profile - ADPL`,
  meta: [
    {
      name: 'description',
      content: 'View user profile and information'
    }
  ]
})
</script>
