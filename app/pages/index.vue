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
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Create Requests</h3>
            <p class="">Upload template images and specify coordinates</p>
          </div>
          
          <div class="text-center p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Collaborate</h3>
            <p class="">Join requests and work together with other artists</p>
          </div>
          
          <div class="text-center p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
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