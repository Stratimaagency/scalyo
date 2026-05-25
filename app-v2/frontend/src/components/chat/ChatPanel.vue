<template>
  <div class="cp-wrapper">
    <CpSidebar
      @select="handleSelect"
      @create-channel="showCreateChannel = true"
      @close="$emit('close')"
    />
    <div class="cp-main">
      <CpMessages
        @rename-channel="handleRenameChannel"
        @create-task="showCreateTask = true"
      />
      <CpInput />
    </div>
    <CpSlideOvers
      :showCreateChannel="showCreateChannel"
      :showCreateTask="showCreateTask"
      :renamingChannel="renamingChannel"
      @close-create-channel="showCreateChannel = false"
      @close-create-task="showCreateTask = false"
      @close-rename="renamingChannel = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import CpSidebar from './CpSidebar.vue'
import CpMessages from './CpMessages.vue'
import CpInput from './CpInput.vue'
import CpSlideOvers from './CpSlideOvers.vue'

defineEmits(['close'])

const store = useChatStore()
const showCreateChannel = ref(false)
const showCreateTask = ref(false)
const renamingChannel = ref(null)

function handleSelect(id) {
  store.setActive(id)
}

function handleRenameChannel(ch) {
  renamingChannel.value = ch
}

onMounted(() => {
  if (store.channels.length === 0) store.init()
})

onUnmounted(() => {
  store.destroy()
})
</script>

<style scoped>
.cp-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-white);
}
.cp-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
