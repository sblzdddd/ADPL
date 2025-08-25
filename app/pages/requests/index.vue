<template>
  <div class="min-h-screen pt-8">
    <div class="w-full">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold">Paint Requests</h1>
          <NuxtLink to="/create">
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
      <div v-else-if="paintRequests.data.value && paintRequests.data.value.data.length > 0" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <PaintRequestCard
            v-for="request in paintRequests.data.value.data as PaintRequest[]"
            :key="request._id"
            :request="request"
            :hide-user="false"
          />
        </div>

        <!-- Pagination -->
        <div v-if="paintRequests.data.value.pagination.pages > 1" class="flex items-center justify-center gap-2">
          <Button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </Button>
          
          <span class="px-3 py-2 text-gray-700">
            Page {{ currentPage }} of {{ paintRequests.data.value.pagination.pages }}
          </span>
          
          <Button
            :disabled="currentPage >= paintRequests.data.value.pagination.pages"
            @click="changePage(currentPage + 1)"
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

useHead({
  title: 'Paint Requests - ADPL',
  meta: [
    {
      name: 'description',
      content: 'View all paint requests and create your own'
    }
  ]
})

const loading = ref(false);
const error = ref('');
const filters = ref({
  tags: '',
  owner: ''
});

const currentPage = ref(1);

// Fetch paint requests on page load
onMounted(() => {
  fetchPaintRequests();
});

await useFetch('/api/paint-requests', {
  method: 'GET',
  key: 'paint-requests',
  query: {
    page: currentPage.value,
    limit: 20,
    tags: filters.value.tags,
    owner: filters.value.owner
  },
  lazy: true
});

const paintRequests = useNuxtData<InternalApi['/api/paint-requests']['get']>('paint-requests');

const fetchPaintRequests = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await useFetch('/api/paint-requests', {
      method: 'GET',
      key: 'paint-requests',
      query: {
        page: currentPage.value,
        limit: 20,
        tags: filters.value.tags,
        owner: filters.value.owner
      }
    });
  } catch (err) {
    console.error('Error fetching paint requests:', err);
    error.value = 'Failed to load paint requests. Please try again.';
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage: number) => {
  if (newPage >= 1 && paintRequests.data.value && newPage <= paintRequests.data.value.pagination.pages) {
    currentPage.value = newPage;
    fetchPaintRequests();
  }
};
</script>
