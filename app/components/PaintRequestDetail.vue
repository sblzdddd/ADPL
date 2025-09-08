<template>
  <div class="mx-auto mb-40 rounded-lg">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/requests"
          >
            <Button variant="ghost" size="icon">
              <Icon name="mdi:arrow-left" size="25" />
            </Button>
          </NuxtLink>
          <h1 v-if="!isEditing" class="text-3xl font-bold">{{ request.title }}</h1>
          <Input
            v-else
            v-model="editData.title"
            placeholder="Enter title"
            size="lg"
          />
        </div>
        
        <!-- Edit/Delete Actions -->
        <AuthState v-slot="{ loggedIn, user }">
          <div v-if="loggedIn && user && isOwner(user)" class="flex items-center gap-2">
            <Button
              v-if="!isEditing"
              variant="outline"
              @click="startEdit"
            >
              <Icon name="lucide:pencil" size="16" />
              <span class="hidden md:block">Edit</span>
            </Button>
            <Button
              v-if="!isEditing"
              variant="destructive"
              @click="confirmDelete"
            >
              <Icon name="lucide:trash" size="16" />
              <span class="hidden md:block">Delete</span>
            </Button>
            <Button
              v-if="isEditing"
              variant="default"
              :disabled="saving"
              @click="saveChanges"
            >
              <Icon name="lucide:save" size="16" />
              <span v-if="saving" class="hidden md:block">Saving...</span>
              <span v-else class="hidden md:block">Save</span>
            </Button>
            <Button
              v-if="isEditing"
              variant="outline"
              @click="cancelEdit"
            >
              <Icon name="lucide:x" size="16" />
              <span class="hidden md:block">Cancel</span>
            </Button>
          </div>
        </AuthState>
      </div>
      
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Image -->
        <div class="info-card relative !bg-gray-200 h-64">
          <div class="absolute top-0 right-0 gap-2 p-4 flex items-center justify-center">
            <Button variant="default" size="icon" class="shadow-md" @click="copyImage">
              <Icon name="lucide:copy" size="20" />
            </Button>
            <Button variant="default" size="icon" class="shadow-md" @click="downloadImage">
              <Icon name="lucide:download" size="20" />
            </Button>
          </div>
          <img 
            v-if="request.image?.url && !imageError"
            :src="request.image.url"
            :alt="`Paint request by ${request.owner?.name}`"
            class="w-full h-full object-contain"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="text-gray-500">No Image</div>
          </div>
          
          <!-- Image Upload in Edit Mode -->
          <div 
            v-if="isEditing" 
            class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            @click="triggerImageUpload"
          >
            <div class="flex flex-col items-center justify-center">
              <Icon name="mdi:camera" size="48" class="mx-auto mb-2" />
              <span>Click to change image</span>
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageChange"
              >
            </div>
          </div>
        </div>
        
        <!-- Coordinates -->
        <div class="info-card">
          <div class="flex flex-row justify-between">
            <h3 class="text-lg font-semibold mb-3">Coordinates</h3>
            <Button variant="ghost" size="icon" @click="openLocation">
              <Icon name="mdi:open-in-new" size="20" />
            </Button>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div class="text-center">
              <div v-if="!isEditing" class="text-2xl font-bold text-blue-600">{{ request.coordinates.TlX }}</div>
              <Input
                v-else
                v-model.number="editData.coordinates.TlX"
                type="number"
                class="text-center pl-6 font-bold text-blue-600"
              />
              <div class="text-sm">Top Left X</div>
            </div>
            <div class="text-center">
              <div v-if="!isEditing" class="text-2xl font-bold text-blue-600">{{ request.coordinates.TlY }}</div>
              <Input
                v-else
                v-model.number="editData.coordinates.TlY"
                type="number"
                class="text-center pl-6 font-bold text-blue-600"
              />
              <div class="text-sm">Top Left Y</div>
            </div>
            <div class="text-center">
              <div v-if="!isEditing" class="text-2xl font-bold text-blue-600">{{ request.coordinates.Px }}</div>
              <Input
                v-else
                v-model.number="editData.coordinates.Px"
                type="number"
                class="text-center pl-6 font-bold text-blue-600"
              />
              <div class="text-sm">Point X</div>
            </div>
            <div class="text-center">
              <div v-if="!isEditing" class="text-2xl font-bold text-blue-600">{{ request.coordinates.Py }}</div>
              <Input
                v-else
                v-model.number="editData.coordinates.Py"
                type="number"
                class="text-center pl-6 font-bold text-blue-600"
              />
              <div class="text-sm">Point Y</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column - Owner Info & Actions -->
      <div class="space-y-6">
        <!-- Owner Info -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Owner</h3>
          <div class="flex items-center gap-3">
            <img
              v-if="request.owner?.picture"
              :src="request.owner.picture"
              :alt="request.owner.name"
              class="w-12 h-12 rounded-full"
            >
            <div v-else class="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <span class="text-lg">{{ request.owner?.name?.charAt(0) }}</span>
            </div>
            <div>
              <NuxtLink :to="`/user/${request.owner?._id}`">
                <div class="font-medium">{{ request.owner?.name }}</div>
              </NuxtLink>
              <div class="text-sm">{{ request.owner?.email }}</div>
            </div>
          </div>
        </div>

        <!-- Participants -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Participants ({{ request.participants?.length || 0 }})</h3>
          <div v-if="request.participants?.length > 0" class="space-y-2">
            <div
              v-for="participant in request.participants"
              :key="participant._id"
              class="flex items-center gap-3"
            >
              <img
                v-if="participant.picture"
                :src="participant.picture"
                :alt="participant.name"
                class="w-8 h-8 rounded-full"
              >
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-sm">{{ participant.name.charAt(0) }}</span>
              </div>
              <NuxtLink :to="`/user/${participant?._id}`">
                <span class="text-sm">{{ participant.name }}</span>
              </NuxtLink>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm">No participants yet</div>
          
          <!-- Join button -->
          <AuthState v-slot="{ loggedIn, user }">
            <Button
              v-if="loggedIn && user && !isParticipant(user) && !isOwner(user)"
              :disabled="joining"
              class="mt-3"
              @click="joinRequest"
            >
              <span v-if="joining">Joining...</span>
              <span v-else>Join Request</span>
            </Button>
          </AuthState> 
        </div>

        <!-- Request Info -->
        <div class="info-card">
          <h3 class="text-lg font-semibold mb-3">Request Info</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Created:</span>
              <span class="text-muted-foreground">{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Updated:</span>
              <span class="text-muted-foreground">{{ formatDate(request.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments Section -->
    <Comments :request-id="request._id"/>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import type { PaintRequest } from '../../shared/types/paint_request';

interface Props {
  request: PaintRequest;
}

const props = defineProps<Props>();

const request = ref<PaintRequest>(props.request);
const joining = ref(false);
const imageError = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const imageInput = ref<HTMLInputElement>();
const selectedImageFile = ref<File | null>(null);

// Edit data state
const editData = ref({
  title: '',
  coordinates: {
    TlX: 0,
    TlY: 0,
    Px: 0,
    Py: 0
  },
});

const isOwner = (user: AuthUser) => {
  return !!user && user.id === request.value.owner._id;
};

const isParticipant = (user: AuthUser) => {
  return !!user && request.value.participants?.some(p => p._id === user.id);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const startEdit = () => {
  editData.value = {
    title: request.value.title,
    coordinates: { ...request.value.coordinates },
  };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  selectedImageFile.value = null;
  // Reset image to original state
  imageError.value = false;
};

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log('Image changed:', file);
    
    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Update the local image preview
        request.value.image = {
          url: e.target.result as string,
          size: file.size,
          originalFilename: file.name
        };
        // Reset image error state
        imageError.value = false;
      }
    };
    reader.readAsDataURL(file);
    
    // Store the file for later upload
    selectedImageFile.value = file;
  }
};

const triggerImageUpload = () => {
  imageInput.value?.click();
};

const saveChanges = async () => {
  saving.value = true;
  
  try {
    const formData = new FormData();
    
    // Add all the edit data to form data
    formData.append('title', editData.value.title);
    formData.append('coordinates', JSON.stringify(editData.value.coordinates));
    
    // Add image file if a new one was selected
    if (selectedImageFile.value) {
      formData.append('image', selectedImageFile.value);
    }
    
    const response = await $fetch(`/api/paint-requests/${request.value._id}`, {
      method: 'PUT',
      body: formData
    });
    
    if (response.success) {
      // Update the local request data
      Object.assign(request.value, response.data);
      isEditing.value = false;
      selectedImageFile.value = null;
      
      // Show success message
      console.log('Paint request updated successfully!');
    }
  } catch (error) {
    console.error('Error updating paint request:', error);
    // Handle error (show toast, etc.)
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  if (confirm('Are you sure you want to delete this paint request? This action cannot be undone.')) {
    await deleteRequest();
  }
};

const deleteRequest = async () => {
  try {
    const response = await $fetch(`/api/paint-requests/${request.value._id}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      // Redirect to requests list
      await navigateTo('/requests');
    }
  } catch (error) {
    console.error('Error deleting paint request:', error);
    // Handle error (show toast, etc.)
  }
};

const joinRequest = async () => {
  joining.value = true;
  
  try {
    const response = await $fetch<InternalApi['/api/paint-requests/:id/join']['post']>(`/api/paint-requests/${request.value._id}/join`, {
      method: 'POST'
    });
    
    if (response.success) {
      // Update the local request data with the new participant
      request.value.participants = response.data.participants;
      // Show success message (you can implement a toast notification here)
      console.log('Successfully joined the request!');
    }
  } catch (error) {
    console.error('Error joining request:', error);
    // Handle error (show toast, etc.)
  } finally {
    joining.value = false;
  }
};

const handleImageError = () => {
  imageError.value = true;
};
function convertCoordinatesToLatLng(tlX: number, tlY: number, pxX: number, pxY: number, zoom: number) {
    const TILE_SIZE = 1000;
    const totalTiles = Math.pow(2, zoom);
    const totalPixels = totalTiles * TILE_SIZE;

    // 1. Calculate the total pixel position from the world's top-left corner (0,0)
    const totalPxX = (tlX * TILE_SIZE) + pxX;
    const totalPxY = (tlY * TILE_SIZE) + pxY;

    // 2. Normalize the pixel coordinates to a value between 0 and 1
    const normalizedX = totalPxX / totalPixels;
    const normalizedY = totalPxY / totalPixels;

    // 3. Convert normalized coordinates back to lat/lng using inverse Mercator projection
    // Longitude is a linear mapping from normalized X
    const lng = (normalizedX * 360) - 180;

    // Latitude requires the inverse Mercator projection formula
    // The formula is derived from: y_norm = 0.5 - atanh(sin(lat_rad)) / (2 * PI)
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * normalizedY)));
    const lat = latRad * (180 / Math.PI);

    return { lat, lng };
}

const openLocation = () => {
  const { lat, lng } = convertCoordinatesToLatLng(request.value.coordinates.TlX, request.value.coordinates.TlY, request.value.coordinates.Px, request.value.coordinates.Py, 11);
  window.open(`https://wplace.live/?lng=${lng}&lat=${lat}&zoom=14`, '_blank');
};

const copyImage = async () => {
  if (!request.value.image?.url) {
    console.warn('No image to copy');
    return;
  }

  try {
    // Fetch the image as a blob
    const response = await fetch(request.value.image.url);
    const blob = await response.blob();
    
    // Copy to clipboard using Clipboard API
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      await navigator.clipboard.write([clipboardItem]);
      console.log('Image copied to clipboard successfully!');
    } else {
      // Fallback for older browsers
      console.warn('Clipboard API not supported, falling back to copy image URL');
      await navigator.clipboard.writeText(request.value.image.url);
    }
  } catch (error) {
    console.error('Error copying image:', error);
    // Fallback: copy the image URL
    try {
      await navigator.clipboard.writeText(request.value.image.url);
      console.log('Image URL copied to clipboard');
    } catch (fallbackError) {
      console.error('Failed to copy image URL:', fallbackError);
    }
  }
};

const downloadImage = async () => {
  if (!request.value.image?.url) {
    console.warn('No image to download');
    return;
  }

  try {
    // Fetch the image as a blob
    const response = await fetch(request.value.image.url);
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename - use original filename if available, otherwise generate one
    const filename = request.value.image.originalFilename || 
                   `paint-request-${request.value._id}.${blob.type.split('/')[1] || 'jpg'}`;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Image downloaded successfully!');
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

watch(() => props.request, (val) => {
  request.value = JSON.parse(JSON.stringify(val)) as PaintRequest;
  imageError.value = false;
}, { deep: true });
</script>
<style scoped>
@reference '../assets/css/main.css';

.info-card {
  @apply bg-background p-4 rounded-2xl shadow-md;
}

</style>
