<template>
  <div class="flex flex-col min-h-screen">
    <div class="absolute inset-0 z-[-1]">
      <FlickeringGrid 
        class="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)]" 
        color="#60A5FA" 
        :flicker-chance="0.01"
      />
    </div>
    <div class="sticky top-0 left-0 z-50 flex justify-center items-center py-4">
      <header class="flex items-center justify-between w-full max-w-6xl">
        <div class="flex items-center gap-2">
          <NuxtLink to="/">
            <img src="/icons/adpl-icon.png" alt="Logo" class="h-10 w-10" style="image-rendering: pixelated;">
          </NuxtLink>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/">
            <Button variant="ghost">
              <Icon name="lucide:user" size="16" />
              <span>Login</span>
            </Button>
          </NuxtLink>
        </div>
      </header>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import FlickeringGrid from '@/components/ui/flickering-grid/FlickeringGrid.vue'
import { Button } from '@/components/ui/button'
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
