<script setup lang="ts">
import { defineProps, computed, PropType } from 'vue';
import type { Participant } from '../../types';
import ParticipantItem from './ParticipantItem.vue';

/**
 * Component props interface
 */
const props = defineProps({
  // List of participants to display
  participants: {
    type: Array as PropType<Participant[]>,
    required: true
  },
  // Function to call when adding a new participant
  addParticipant: {
    type: Function as PropType<() => void>,
    required: false
  },
  // Function to call when removing a participant
  removeParticipant: {
    type: Function as PropType<(id: number) => void>,
    required: false
  },
  // Function to call when selecting a participant
  onParticipantSelect: {
    type: Function as PropType<(participant: Participant, event: MouseEvent) => void>,
    required: false
  },
  // Function to call when starting drag operation
  onParticipantDragStart: {
    type: Function as PropType<(event: DragEvent, participant: Participant) => void>,
    required: false
  },
  // String for new participant name input
  newParticipantName: {
    type: String,
    default: ''
  },
  // Function to check if participant is in any group
  isInGroup: {
    type: Function as PropType<(id: number) => boolean>,
    required: true
  },
  // Loading state for adding participant
  loading: {
    type: Boolean,
    default: false
  }
});

// Computed property to check if add button should be disabled
const isAddDisabled = computed(() => !props.newParticipantName.trim() || props.loading);

</script>

<template>
  <div class="participants-sidebar">
    <h2>Участники</h2>
    
    <!-- Форма добавления участника -->
    <div class="add-participant">
      <input
        v-model="newParticipantName"
        @keyup.enter="addParticipant"
        placeholder="Введите ФИО"
        :disabled="loading"
      />
      <button 
        @click="addParticipant"
        :disabled="isAddDisabled"
      >
        {{ loading ? '...' : '+' }}
      </button>
    </div>

    <!-- Список участников -->
    <div class="participants-list">
      <ParticipantItem
        v-for="participant in participants"
        :key="participant.id"
        :participant="participant"
        :isInGroup="isInGroup(participant.id)"
        :onRemove="removeParticipant"
        :onSelect="onParticipantSelect"
        :onDragStart="onParticipantDragStart"
      />
    </div>
  </div>
</template>

<style scoped>
.participants-sidebar {
  max-width: 30vw;
  padding: 20px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  height: 100vh;
  overflow-y: auto;
}

.add-participant {
  display: flex;
  margin-bottom: 15px;
}

.add-participant input {
  flex: 1;
  padding: 8px;
  margin-right: 5px;
}

.add-participant button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.add-participant button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.add-participant button:not(:disabled):hover {
  background-color: #45a049;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-participant input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>