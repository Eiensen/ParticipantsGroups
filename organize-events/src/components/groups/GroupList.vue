<script setup lang="ts">
import { ref } from 'vue';
import GroupItem from './GroupItem.vue';
import ModalItem from '../../views/ModalItem.vue';
import type { Group, Participant } from '../../types';
import { useStore } from '../../store/useStore';

interface Props {
  groups: Group[];
  participants: Participant[];
  loading?: boolean;
  selectedParticipantId?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', id: string, updates: Partial<Group>): void;
  (e: 'remove', id: string): void;
  (e: 'drop', event: DragEvent, groupId: string): void;
}>();

const showNewGroupDialog = ref(false);
const newGroup = ref({
  name: '',
  description: '',
  maxParticipants: 0,
});

const { addGroup } = useStore();

const handleDropOnGroup = (event: DragEvent, groupId: string) => {
  if (!event.dataTransfer) return;
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    if (!data.participantId) return;
    
    // Передаем событие выше для обновления в store
    emit('drop', event, groupId);
  } catch (error) {
    console.error('Error handling drop in group list:', error);
  }
};

const handleRemoveGroup = (groupId: string) => {
  emit('remove', groupId);
};

const handleUpdateGroup = (id: string, updates: Partial<Group>) => {
  emit('update', id, updates);
};

const handleCreateGroup = async () => {
  if (!newGroup.value.name.trim()) return;
  
  try {
    await addGroup({
      name: newGroup.value.name,
      description: newGroup.value.description,
      maxParticipants: newGroup.value.maxParticipants || undefined,
      participants: []
    });
    
    // Reset form
    newGroup.value = {
      name: '',
      description: '',
      maxParticipants: 0,
    };
    showNewGroupDialog.value = false;
  } catch (error) {
    console.error('Failed to create group:', error);
  }
};
</script>

<template>  <div class="groups-container" :class="{ 'is-loading': loading }">
    <div v-if="loading" class="loading-overlay">
      Загрузка...
    </div>

    <div v-else-if="groups.length === 0" class="empty-state">
      Нет созданных групп. Создайте новую группу, чтобы начать распределение участников.
    </div>

    <div v-else class="groups-list">
      <GroupItem
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :participants="participants"
        :selected-participant-id="selectedParticipantId"
        @remove="handleRemoveGroup"
        @update="handleUpdateGroup"
        @drop="(event: any) => handleDropOnGroup(event, group.id || '')"
      />
    </div>

    <!-- Modal for creating new group -->
    <ModalItem v-if="showNewGroupDialog" @close="showNewGroupDialog = false">
      <template #header>
        <h3>Создать новую группу</h3>
      </template>

      <form @submit.prevent="handleCreateGroup" class="group-form">
        <div class="form-group">
          <label for="groupName">Название группы</label>
          <input
            id="groupName"
            v-model="newGroup.name"
            type="text"
            required
            placeholder="Введите название группы"
          />
        </div>

        <div class="form-group">
          <label for="groupDescription">Описание</label>
          <textarea
            id="groupDescription"
            v-model="newGroup.description"
            rows="3"
            placeholder="Опишите назначение группы"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="maxParticipants">Максимальное количество участников</label>
          <input
            id="maxParticipants"
            v-model.number="newGroup.maxParticipants"
            type="number"
            min="0"
            placeholder="Оставьте 0 для неограниченного количества"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button">Создать</button>
          <button 
            type="button" 
            @click="showNewGroupDialog = false"
            class="cancel-button"
          >
            Отмена
          </button>
        </div>
      </form>
    </ModalItem>
  </div>
</template>

<style scoped>
.groups-container {
  padding: 20px;
  position: relative;
}

.groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.groups-header h2 {
  margin: 0;
  color: #2c3e50;
}

.add-group-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-group-button:hover {
  background-color: #45a049;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.groups-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.group-form {
  display: grid;
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.submit-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
}

.submit-button:hover {
  background-color: #45a049;
}

.cancel-button {
  background-color: #f5f5f5;
}

.cancel-button:hover {
  background-color: #e8e8e8;
}

@media (max-width: 768px) {
  .groups-list {
    grid-template-columns: 1fr;
  }
}
</style>