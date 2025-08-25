<template>
  <div class="mx-auto mb-40 rounded-lg">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-4">
        <NuxtLink
          to="/requests"
        >
          <Button variant="ghost" size="icon">
            <Icon name="mdi:arrow-left" size="25" />
          </Button>
        </NuxtLink>
        <h1 class="text-3xl font-bold">{{ request.title }}</h1>
      </div>
      
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Image -->
        <div class="info-card !bg-gray-200 h-64">
          <img 
            v-if="request.image?.url && !imageError"
            :src="request.image.url"
            :alt="`Paint request by ${request.owner?.name}`"
            class="w-full h-full object-contain"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="text-gray-500">No Image</div>
          </div>
        </div>
        <!-- Coordinates -->
        <div class="info-card">
          <div class="flex flex-row justify-between">
            <h3 class="text-lg font-semibold mb-3">Coordinates</h3>
            <Button variant="ghost" size="icon">
              <Icon name="mdi:open-in-new" size="20" />
            </Button>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ request.coordinates.TlX }}</div>
              <div class="text-sm">Top Left X</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ request.coordinates.TlY }}</div>
              <div class="text-sm">Top Left Y</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ request.coordinates.Px }}</div>
              <div class="text-sm">Point X</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ request.coordinates.Py }}</div>
              <div class="text-sm">Point Y</div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in request.tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>

      </div>

      <!-- Right Column - Owner Info & Actions -->
      <div class="space-y-6">
        <!-- Owner Info -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Owner</h3>
          <div class="flex items-center gap-3">
            <img
              v-if="request.owner?.picture"
              :src="request.owner.picture"
              :alt="request.owner.name"
              class="w-12 h-12 rounded-full"
            >
            <div v-else class="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <span class="text-lg">{{ request.owner?.name?.charAt(0) }}</span>
            </div>
            <div>
              <div class="font-medium">{{ request.owner?.name }}</div>
              <div class="text-sm">{{ request.owner?.email }}</div>
            </div>
          </div>
        </div>

        <!-- Participants -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Participants ({{ request.participants?.length || 0 }})</h3>
          <div v-if="request.participants?.length > 0" class="space-y-2">
            <div
              v-for="participant in request.participants"
              :key="participant._id"
              class="flex items-center gap-3"
            >
              <img
                v-if="participant.picture"
                :src="participant.picture"
                :alt="participant.name"
                class="w-8 h-8 rounded-full"
              >
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-sm">{{ participant.name.charAt(0) }}</span>
              </div>
              <span class="text-sm">{{ participant.name }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm">No participants yet</div>
          
          <!-- Join button -->
          <AuthState v-slot="{ loggedIn, user }">
            <Button
              v-if="loggedIn && user && !isParticipant(user) && !isOwner(user)"
              :disabled="joining"
              class="mt-3"
              @click="joinRequest"
            >
              <span v-if="joining">Joining...</span>
              <span v-else>Join Request</span>
            </Button>
          </AuthState>
        </div>

        <!-- Request Info -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Request Info</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Created:</span>
              <span class="text-muted-foreground">{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Updated:</span>
              <span class="text-muted-foreground">{{ formatDate(request.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments Section -->
    <Comments :request-id="request._id"/>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button';
import type { PaintRequest } from '../../shared/types/paint_request';

interface Props {
  request: PaintRequest;
}

const props = defineProps<Props>();

const request = ref<PaintRequest>(props.request);
const joining = ref(false);
const imageError = ref(false);

const isOwner = (user: AuthUser) => {
  return !!user && user.id === request.value.owner._id;
};

const isParticipant = (user: AuthUser) => {
  return !!user && request.value.participants?.some(p => p._id === user.id);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const joinRequest = async () => {
  joining.value = true;
  
  try {
    const response = await $fetch<InternalApi['/api/paint-requests/:id/join']['post']>(`/api/paint-requests/${request.value._id}/join`, {
      method: 'POST'
    });
    
    if (response.success) {
      // Update the local request data with the new participant
      request.value.participants = response.data.participants;
      // Show success message (you can implement a toast notification here)
      console.log('Successfully joined the request!');
    }
  } catch (error) {
    console.error('Error joining request:', error);
    // Handle error (show toast, etc.)
  } finally {
    joining.value = false;
  }
};

const handleImageError = () => {
  imageError.value = true;
};

watch(() => props.request, (val) => {
  request.value = JSON.parse(JSON.stringify(val)) as PaintRequest;
  imageError.value = false;
}, { deep: true });
</script>
<style scoped>
@reference '../assets/css/main.css';

.info-card {
  @apply bg-background p-4 rounded-2xl shadow-md;
}

</style>
