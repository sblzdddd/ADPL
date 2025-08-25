<template>
  <div class="mt-8">
    <h3 class="text-xl font-semibold mb-4">Comments ({{ comments.data?.value?.data?.length || 0 }})</h3>
    
    <!-- Add Comment -->
    <div class="mb-6">
      <AuthState v-slot="{ loggedIn, user }">
        <form v-if="loggedIn && user" class="space-y-3" @submit.prevent="addComment()">
          <textarea
            v-model="newComment"
            placeholder="Add a comment..."
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <div class="flex justify-end">
            <Button type="submit" variant="default" :disabled="submittingComment">
              <span v-if="submittingComment">Posting...</span>
              <span v-else>Post Comment</span>
            </Button>
          </div>
        </form>
      </AuthState>
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
      <div
        v-for="comment in comments.data?.value?.data || []"
        :key="comment._id"
        class="bg-background p-4 rounded-2xl shadow-md"
      >
        <CommentItem
          :comment="comment"
          :request-id="requestId"
        />
      </div>
      
      <div v-if="!comments.data?.value?.data?.length" class="text-center text-gray-500 py-8">
        No comments yet. Be the first to comment!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button';

// Component name for linting
defineOptions({
  name: 'CommentsSection'
});

interface Props {
  requestId: string;
}

const props = defineProps<Props>();

const newComment = ref('');
const submittingComment = ref(false);

await useFetch<
  InternalApi['/api/paint-requests/:id/comments']['get']
>(`/api/paint-requests/${props.requestId}/comments`, {
  key: `comments-${props.requestId}`,
});

const comments = useNuxtData(`comments-${props.requestId}`);

const addComment = async () => {
  if (!newComment.value.trim()) return;
  
  submittingComment.value = true;
  
  try {
    const response = await $fetch<InternalApi['/api/paint-requests/:id/comments']['post']>(`/api/paint-requests/${props.requestId}/comments`, {
      method: 'POST',
      body: {
        content: newComment.value.trim()
      }
    });
    
    if (response.success && response.data) {
      refreshNuxtData(`comments-${props.requestId}`);
      newComment.value = '';
    }
  } catch (error) {
    console.error('Error adding comment:', error);
  } finally {
    submittingComment.value = false;
  }
}
</script>

<style scoped>
</style>
