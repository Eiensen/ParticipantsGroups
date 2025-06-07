<script setup lang="ts">
import { computed } from 'vue';
import type { Group, Participant } from '../../types';

interface Props {
  group: Group;
  participants: Participant[];
  selectedParticipantId?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'update', id: string, updates: Partial<Group>): void;
  (e: 'drop', event: DragEvent, groupId: string): void;
}>();

const groupParticipants = computed(() => {
  return props.participants.filter(p => props.group.participants?.includes(p.id || ''));
});

const containsSelectedParticipant = computed(() => {
  return props.selectedParticipantId && props.group.participants?.includes(props.selectedParticipantId);
});

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (props.group.id) {
    emit('drop', event, props.group.id);
  }
}

const handleRemove = () => {
  if (props.group.id && confirm('Вы уверены, что хотите удалить эту группу?')) {
    emit('remove', props.group.id);
  }
};

const handleUpdate = (updates: Partial<Group>) => {
  if (props.group.id) {
    emit('update', props.group.id, updates);
  }
};
</script>

<template>  <div 
    class="group-item"
    :class="{
      'contains-selected': containsSelectedParticipant
    }"
    :data-id="group.id"
    :data-testid="'group-' + group.id"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div class="group-header">
      <h3>{{ group.name }}</h3>
      <div class="group-info">
        <span v-if="group.maxParticipants" class="participants-count">
          {{ groupParticipants.length }}/{{ group.maxParticipants }}
        </span>
        <button @click="handleRemove" class="remove-button">×</button>
      </div>
    </div>
    
    <p v-if="group.description" class="group-description">
      {{ group.description }}
    </p>

    <div class="participants-list">
      <div v-if="groupParticipants.length === 0" class="empty-message">
        Перетащите участников сюда
      </div>
      <div
        v-for="participant in groupParticipants"
        :key="participant.id"
        class="participant-chip"
      >
        {{ participant.name }}
        <button 
          @click="handleUpdate({ 
            participants: group.participants.filter((id: any) => id !== participant.id)
          })"
          class="remove-participant"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-item {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.group-item.contains-selected {
  border-color: #2196F3;
  background-color: #e3f2fd;
  box-shadow: 0 0 0 2px #2196F3;
}

.group-item[dragover] {
  border: 2px dashed #4CAF50;
  background-color: #f1f8e9;
}

.group-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-header h3 {
  margin: 0;
  color: #2c3e50;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participants-count {
  font-size: 0.9em;
  color: #666;
}

.remove-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.remove-button:hover {
  color: #dc3545;
}

.group-description {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 0.9em;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 50px;
}

.empty-message {
  width: 100%;
  text-align: center;
  color: #999;
  padding: 16px;
  border: 2px dashed #ddd;
  border-radius: 4px;
}

.participant-chip {
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9em;
}

.remove-participant {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
}

.remove-participant:hover {
  color: #dc3545;
}

.group-item.highlight-group {
  border-color: #4CAF50;
  background-color: #f1f8e9;
}

.group-item.drag-over {
  border-style: dashed;
  border-color: #2196F3;
  background-color: #e3f2fd;
}
</style>