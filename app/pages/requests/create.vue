<template>
  <div class="min-h-screen">
    <div class="w-full">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/requests"
        >
          <Button variant="ghost" class="px-2 mb-4">
            <Icon name="mdi:arrow-left" size="24" />
            Back to Requests
          </Button>
        </NuxtLink>
        <div class="pl-2 w-full flex flex-col items-center">
          <h1 class="text-3xl font-bold mb-3">Create New Paint Request</h1>
          <p class="text-gray-500">Fill out the form below to create a new paint request.</p>
          <p class="text-gray-500">Make sure to provide accurate coordinates and relevant tags.</p>
        </div>
      </div>

      <!-- Create Form -->
      <CreatePaintRequestForm
        @created="(data: PaintRequest) => handleRequestCreated(data)"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CreatePaintRequestForm from '~/components/CreatePaintRequestForm.vue';
import { Button } from '~/components/ui/button';

const router = useRouter();

const handleRequestCreated = (newRequest: PaintRequest) => {
  // Show success message (you can implement a toast notification here)
  console.log('Paint request created successfully!');
  
  // Redirect to the new request detail page
  router.push(`/requests/${newRequest._id}`);
};

const handleCancel = () => {
  // Redirect back to the paint requests list
  router.push('/requests');
};

// Set page title
useHead({
  title: 'Create Paint Request - ADPL',
  meta: [
    {
      name: 'description',
      content: 'Create a new paint request with coordinates, tags, and image upload'
    }
  ]
});
</script>
