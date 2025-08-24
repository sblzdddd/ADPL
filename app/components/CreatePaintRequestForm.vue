<template>
  <div class="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-md">
    <form class="space-y-6" @submit.prevent="handleSubmit">
      
      <div>
        <label class="block text-sm font-medium mb-2">Title</label>
        <div class="space-y-2">
          <Input
            v-model="form.title"
            required
            type="text"
            placeholder="Add a title"
          />
        </div>
      </div>
      <!-- Image Upload -->
      <div>
        <label class="block text-sm font-medium mb-3">
          Image (PNG, max 2MB)
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref="fileInput"
            type="file"
            accept="image/png"
            class="hidden"
            @change="handleFileChange"
          >
          <div v-if="!selectedFile" class="cursor-pointer" @click="fileInput?.click()">
            <div class="text-gray-600 mb-2">
              <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">Click to upload or drag and drop</p>
          </div>
          <div v-else class="space-y-2">
            <img :src="previewUrl" alt="Preview" class="mx-auto h-32 w-auto rounded" >
            <p class="text-sm">{{ selectedFile.name }}</p>
            <Button
              variant="ghost"
              class="!text-red-600"
              @click="removeFile"
            >
              Remove
            </Button>
          </div>
        </div>
        <p v-if="fileError" class="mt-1 text-sm text-red-600">{{ fileError }}</p>
      </div>

      <!-- Coordinates -->
      <div>
        <label class="block text-sm font-medium mb-2">Coordinates</label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs mb-1">TlX</label>
            <Input
              v-model.number="form.coordinates.TlX"
              type="number"
              step="any"
              required
            />
          </div>
          <div>
            <label class="block text-xs mb-1">TlY</label>
            <Input
              v-model.number="form.coordinates.TlY"
              type="number"
              step="any"
              required
            />
          </div>
          <div>
            <label class="block text-xs mb-1">Px</label>
            <Input
              v-model.number="form.coordinates.Px"
              type="number"
              step="any"
              required
            />
          </div>
          <div>
            <label class="block text-xs mb-1">Py</label>
            <Input
              v-model.number="form.coordinates.Py"
              type="number"
              step="any"
              required
            />
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium mb-2">Tags</label>
        <div class="space-y-2">
          <div class="flex gap-2">
            <Input
              v-model="newTag"
              type="text"
              placeholder="Add a tag"
              @keyup.enter="addTag"
            />
            <Button
              variant="default"
              @click.prevent="addTag"
            >
              Add
            </Button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
            >
              {{ tag }}
              <Button
                variant="ghost"
                class="!text-blue-600"
                @click="removeTag(tag)"
              >
                ×
              </Button>
            </span>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-4">
        <Button
          type="submit"
          :disabled="isSubmitting"
          class="flex-1"
        >
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>Create Paint Request</span>
        </Button>
        <Button
          variant="outline"
          @click="$emit('cancel')"
        >
          Cancel
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import type { PaintRequest } from '../../shared/types/paint_request';

interface FormData {
  title: string;
  coordinates: Coordinates;
  tags: string[];
}

const emit = defineEmits<{
  cancel: [];
  created: [data: PaintRequest];
}>();

const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');
const fileError = ref<string>('');
const isSubmitting = ref(false);
const newTag = ref('');

const form = ref<FormData>({
  title: '',
  coordinates: {
    TlX: 0,
    TlY: 0,
    Px: 0,
    Py: 0
  },
  tags: []
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Validate file type
  if (file.type !== 'image/png') {
    fileError.value = 'Only PNG files are allowed';
    return;
  }
  
  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    fileError.value = 'File size must be less than 2MB';
    return;
  }
  
  selectedFile.value = file;
  fileError.value = '';
  
  // Create preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeFile = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag);
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag);
  if (index > -1) {
    form.value.tags.splice(index, 1);
  }
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    fileError.value = 'Please select an image file';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Create multipart form data with all fields
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    formData.append('coordinates', JSON.stringify(form.value.coordinates));
    formData.append('tags', JSON.stringify(form.value.tags));
    formData.append('title', form.value.title);

    // Single API call to create paint request with image
    interface ApiResponse<T> { success: boolean; data: T; message?: string }
    const response = await $fetch<ApiResponse<PaintRequest>>('/api/paint-requests', {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      emit('created', response.data);
      // Reset form
      form.value = {
        coordinates: { TlX: 0, TlY: 0, Px: 0, Py: 0 },
        tags: [],
        title: ''
      };
      removeFile();
    }
  } catch (error) {
    console.error('Error creating paint request:', error);
    // Handle error (show toast, etc.)
  } finally {
    isSubmitting.value = false;
  }
};
</script>
