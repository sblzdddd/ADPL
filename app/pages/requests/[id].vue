<template>
  <div class="min-h-screen py-8">
      <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <p class="mt-2 text-gray-600">Loading paint request...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p class="text-gray-600">{{ error }}</p>
      <NuxtLink
        to="/requests"
        class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Back to Requests
      </NuxtLink>
    </div>

    <!-- Paint Request Detail -->
    <div v-else-if="paintRequest">
      <PaintRequestDetail :request="paintRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PaintRequestDetail from '~/components/PaintRequestDetail.vue';


const route = useRoute();
const loading = ref(false);
const error = ref('');
const paintRequest = ref<PaintRequest | null>(null);

// Fetch paint request on page load
onMounted(() => {
  fetchPaintRequest();
});

const fetchPaintRequest = async () => {
  const id = route.params.id as string;
  
  if (!id) {
    error.value = 'Invalid request ID';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await $fetch(`/api/paint-requests/${id}`);
    
    if (response.success) {
      paintRequest.value = response.data as unknown as PaintRequest;
    } else {
      error.value = 'Failed to load paint request';
    }
  } catch (e) {
    console.error('Error fetching paint request:', e);
    const err = e as { statusCode?: number };
    if (err?.statusCode === 404) {
      error.value = 'Paint request not found';
    } else {
      error.value = 'Failed to load paint request. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

// Update page title when paint request is loaded
watch(paintRequest, (newRequest) => {
  if (newRequest) {
    useHead({
      title: `Paint Request - ${newRequest.owner.name}`,
      meta: [
        {
          name: 'description',
          content: `Paint request with coordinates: TlX: ${newRequest.coordinates.TlX}, TlY: ${newRequest.coordinates.TlY}, Px: ${newRequest.coordinates.Px}, Py: ${newRequest.coordinates.Py}`
        }
      ]
    });
  }
});
</script>
