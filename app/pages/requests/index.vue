<template>
  <div class="min-h-screen py-8">
    <div class="w-full">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold">Paint Requests</h1>
          <NuxtLink to="/requests/create">
            <Button
              variant="default"
            >
              Create Request
            </Button>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
        <p class="mt-2 text-gray-600">Loading paint requests...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="mdi:alert-circle" size="48" class="mx-auto mb-2 text-destructive" />
        <p class="text-gray-600">{{ error }}</p>
        <Button
          @click="fetchPaintRequests"
        >
          Try Again
        </Button>
      </div>

      <!-- Paint Requests Grid -->
      <div v-else-if="paintRequests.length > 0" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PaintRequestCard
            v-for="request in paintRequests"
            :key="request._id"
            :request="request"
          />
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex items-center justify-center gap-2">
          <Button
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            Previous
          </Button>
          
          <span class="px-3 py-2 text-gray-700">
            Page {{ pagination.page }} of {{ pagination.pages }}
          </span>
          
          <Button
            :disabled="pagination.page >= pagination.pages"
            @click="changePage(pagination.page + 1)"
          >
            Next
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon name="mdi:image-search" size="48" class="mx-auto mb-2" />
        <p>No paint requests found</p>
        <p class="text-gray-500 text-sm mt-1">Create the first paint request to get started</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PaintRequestCard from '~/components/PaintRequestCard.vue';
import { Button } from '~/components/ui/button';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const loading = ref(false);
const error = ref('');
const paintRequests = ref<PaintRequest[]>([]);
const pagination = ref<Pagination>({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
});
const filters = ref({
  tags: '',
  owner: ''
});

// Fetch paint requests on page load
onMounted(() => {
  fetchPaintRequests();
});

const fetchPaintRequests = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const queryParams = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    });
    
    if (filters.value.tags) {
      queryParams.append('tags', filters.value.tags);
    }
    
    if (filters.value.owner) {
      queryParams.append('owner', filters.value.owner);
    }
    
    const response = await $fetch(`/api/paint-requests?${queryParams}`);
    
    if (response.success) {
      paintRequests.value = response.data as PaintRequest[];
      pagination.value = response.pagination;
    }
  } catch (err) {
    console.error('Error fetching paint requests:', err);
    error.value = 'Failed to load paint requests. Please try again.';
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= pagination.value.pages) {
    pagination.value.page = newPage;
    fetchPaintRequests();
  }
};
</script>
