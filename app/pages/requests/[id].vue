<template>
  <div class="min-h-full pt-8">
      <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <p class="mt-2">Loading paint request...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 mb-2">
        <Icon name="lucide:alert-circle" size="24" class="text-red-500" />
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
      <PaintRequestDetail :request="paintRequest.data.value?.data as PaintRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PaintRequestDetail from '~/components/PaintRequestDetail.vue';


const route = useRoute();
const loading = ref(false);
const error = ref('');

// Fetch paint request on page load
// onMounted(() => {
//   fetchPaintRequest();
// });

const requestId = computed(() => route.params.id as string);

await useFetch<
  InternalApi['/api/paint-requests/:id']['get']
>(`/api/paint-requests/${requestId.value}`, {
  key: `paint-request-${requestId.value}`,
});

const paintRequest = useNuxtData<InternalApi['/api/paint-requests/:id']['get']>(`paint-request-${requestId.value}`);

// Update page title when paint request is loaded
watch(paintRequest, (newRequest) => {
  if (newRequest) {
    useHead({
      title: `${newRequest.data.value?.data.title} - ADPL`,
      meta: [
        {
          name: 'description',
          content: `Paint request with coordinates: ${newRequest.data.value?.data.coordinates.TlX}, ${newRequest.data.value?.data.coordinates.TlY}, ${newRequest.data.value?.data.coordinates.Px}, ${newRequest.data.value?.data.coordinates.Py}`
        }
      ]
    });
  }
});
</script>
