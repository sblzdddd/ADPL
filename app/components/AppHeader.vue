<template>
  
  <div 
    :class="{ 'bg-background/80 backdrop-blur-md': !isAtTop }"
    class="sticky top-0 left-0 z-50 flex justify-center items-center w-full mb-4 transition-all duration-300"
  >
    <header 
      class="w-full max-w-6xl mx-auto flex items-center justify-between py-4"
    >
      <div class="flex items-center gap-2 md:w-[106px]">
        <NuxtLink to="/">
          <img src="/icons/adpl-icon.png" alt="Logo" class="h-10 w-10" style="image-rendering: pixelated;">
        </NuxtLink>
      </div>
      
      <!-- Navigation Links -->
      <nav class="flex items-center gap-6">
        <Tabs :tabs="tabs" />
      </nav>
      
      <div class="flex items-center gap-2">
        <AuthState v-slot="{ loggedIn, user }">
          <div v-if="loggedIn" class="flex items-center gap-3">
            <NuxtLink :to="`/user/${user?.id}`">
              <Button variant="ghost">
                <img 
                  v-if="user?.picture" 
                  :src="user.picture" 
                  :alt="user.name"
                  class="h-6 w-6 rounded-full"
                >
                <span class="text-sm font-medium hidden md:block">{{ user?.name }}</span>
              </Button>
            </NuxtLink>
          </div>
          <div v-else>
            <Button variant="ghost" @click="openInPopup('/auth/google')">
              <Icon name="mdi:google" size="16" />
              <span>Login</span>
            </Button>
          </div>
        </AuthState>
      </div>
    </header>
  </div>
</template>
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import Tabs from '@/components/ui/tabs/Tabs.vue'

const { openInPopup } = useUserSession()

const isAtTop = useState('isAtTop', () => false)

const updateScroll = () => {
  isAtTop.value = window.scrollY === 0
}

onMounted(() => {
  console.log('AppHeader mounted')
  isAtTop.value = window.scrollY === 0
  window.addEventListener('scroll', updateScroll)
})
onUnmounted(() => {
  console.log('AppHeader unmounted')
  window.removeEventListener('scroll', updateScroll)
})

const tabs = [
  {
    key: 'home',
    label: 'Home',
    to: '/'
  },
  {
    key: 'requests',
    label: 'Requests',
    to: '/requests'
  },
  {
    key: 'create',
    label: 'Create',
    to: '/create'
  }
]
</script>