<template>
  <div class="flex flex-col min-h-screen">
    <div class="fixed inset-0 z-[-1]">
      <FlickeringGrid 
        class="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)]" 
        color="#60A5FA" 
        :flicker-chance="0.01"
      />
    </div>
    <AppHeader />
    <div class="w-full max-w-6xl mx-auto px-4">
      <slot />
    </div>
    <div class="gap-2 w-full bg-background py-6 flex flex-col items-center justify-center">
      <img src="/adpl-title.png" alt="ADPL" class="w-full max-w-xs">
      <p class="text-sm text-gray-500">
        Version 0.1.0, created with ♥ by <a href="https://github.com/sblzdddd" target="_blank" class="text-blue-500">sblzdddd</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlickeringGrid from '@/components/ui/flickering-grid/FlickeringGrid.vue'
import AppHeader from '@/components/AppHeader.vue'
</script>

<style lang="postcss">
.page-enter-active,
.page-leave-active {
  transition: all 0.15s ease-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.page-wrapper {
  width: 100%;
  height: 100%;
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.05s ease-out;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
