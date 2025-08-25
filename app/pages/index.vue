<template>
  <div class="w-full min-h-full">
    <div class="w-full flex flex-col items-center justify-center gap-10 py-20">
      <img src="/adpl-title.png" alt="Aid PLACE" class="w-1/2 max-w-md">
      <div class="text-center space-y-4">
        <h1 class="text-3xl font-bold">Welcome to AiD PLACE</h1>
        <p class="text-lg w-full mb-8">
          View, create, and share <a href="https://wplace.live" target="_blank" class="text-blue-600">wplace</a> paint requests.
        </p>
        
        <!-- Action Buttons -->
        <div class="w-full">
          <NuxtLink
            to="/requests"
          >
          <Button variant="default">
            Get Started
          </Button>
          </NuxtLink>
        </div>
        
        <!-- Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div class="text-center p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="lucide:image" size="24" class="text-blue-500" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Create Requests</h3>
            <p class="">Upload template images and specify coordinates</p>
          </div>
          
          <div class="text-center p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="lucide:users" size="24" class="text-green-500" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Collaborate</h3>
            <p class="">Join requests and work together with other artists</p>
          </div>
          
          <div class="text-center p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="lucide:message-circle" size="24" class="text-purple-500" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Discuss</h3>
            <p class="">Comment and discuss details with the community</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button';

// Set page title
useHead({
  title: 'Aid PLACE',
  meta: [
    {
      name: 'description',
      content: 'View, create, and share wplace paint requests. Connect with other artists and collaborate on creative projects.'
    }
  ]
});
</script>

<style scoped></style>