<template>
  
    <div class="rounded-xl bg-background shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <!-- Image -->
      <NuxtLink :to="`/requests/${request._id}`">
        <div class="w-full h-48 bg-gray-200 overflow-hidden">
          <img 
            v-if="request.image?.url"
            :src="request.image.url"
            :alt="`Paint request by ${request.owner?.name}`"
            class="w-full h-full object-cover"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="text-gray-500 text-sm">No Image</div>
          </div>
        </div>
      </NuxtLink>
      
      <!-- Content -->
      <div class="p-4">
        <!-- Coordinates -->
        <div class="mb-3">
          <NuxtLink :to="`/requests/${request._id}`">
            <h3 class="text-lg w-full truncate font-semibold mb-3">{{ request.title }}</h3>
          </NuxtLink>
          <div class="grid grid-cols-4 gap-2 text-xs">
            <div v-for="coord in Object.values(request.coordinates)" :key="coord" class="bg-muted px-2 py-1 rounded">
              {{ coord }}
            </div>
          </div>
        </div>


        <!-- Owner and participants -->
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <img 
              v-if="request.owner?.picture" 
              :src="request.owner.picture" 
              :alt="request.owner.name"
              class="w-6 h-6 rounded-full"
            >
            <div v-else class="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <span class="text-xs text-muted-foreground">{{ request.owner?.name?.charAt(0) }}</span>
            </div>
            <span class="text-sm text-muted-foreground">{{ request.owner?.name }}</span>
          </div>
          
          <div v-if="request.participants?.length > 0" class="text-xs text-gray-500">
            {{ request.participants.length }} participant(s)
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-3">
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="tag in request.tags" 
              :key="tag"
              class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Comments count -->
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            {{ request.commentsCount || 0 }} comment(s)
          </div>
          <div class="text-xs text-gray-400">
            {{ formatDate(request.createdAt) }}
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
  request: PaintRequest;
}

defineProps<Props>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return date.toLocaleDateString();
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
  target.nextElementSibling?.classList.remove('hidden');
};
</script>
