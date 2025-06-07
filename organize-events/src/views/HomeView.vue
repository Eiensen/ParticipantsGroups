<template>
  <div class="view-wrapper">
    <div class="grid-layout">
      <div class="participants-section">
        <div class="section-header">
          <h2>Участники</h2>
          <button 
            class="action-button"
            @click="showParticipantModal = true"
          >
            Добавить участника
          </button>
        </div>        <ParticipantList 
          :participants="participants" 
          :groups="groups"
          :loading="loading.participants"
          :selected-participant-id="selectedParticipantId"
          @add="handleAddParticipant"
          @update="handleUpdateParticipant"
          @remove="handleRemoveParticipant"
          @participant-click="(participant) => selectedParticipantId = participant.id || null"
        />
      </div>

      <div class="groups-section">
        <div class="section-header">
          <h2>Группы</h2>
          <button 
            class="action-button"
            @click="showGroupModal = true"
          >
            Создать группу
          </button>
        </div>        <GroupList 
          :groups="groups"
          :participants="participants"
          :loading="loading.groups"
          :selected-participant-id="selectedParticipantId"
          @update="handleUpdateGroup"
          @remove="handleRemoveGroup"
          @drop="handleDropParticipant"
        />
      </div>
    </div>

    <!-- New Participant Modal -->
    <ModalItem
      v-if="showParticipantModal"
      @close="showParticipantModal = false"
    >
      <template #header>
        <h3>Добавить участника</h3>
      </template>

      <form @submit.prevent="handleParticipantAdd">
        <div class="form-group">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="newParticipant.name"
            type="text"
            placeholder="Введите ФИО"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="newParticipant.email"
            type="email"
            placeholder="Введите email"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Телефон</label>
          <input
            id="phone"
            v-model="newParticipant.phone"
            type="tel"
            placeholder="Введите телефон"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading.addParticipant">
            {{ loading.addParticipant ? 'Добавление...' : 'Добавить' }}
          </button>
          <button 
            type="button" 
            @click="showParticipantModal = false"
            :disabled="loading.addParticipant"
          >
            Отмена
          </button>
        </div>
      </form>
    </ModalItem>

    <!-- New Group Modal -->
    <ModalItem
      v-if="showGroupModal"
      @close="showGroupModal = false"
    >
      <template #header>
        <h3>Создать группу</h3>
      </template>

      <form @submit.prevent="handleGroupAdd">
        <div class="form-group">
          <label for="groupName">Название</label>
          <input
            id="groupName"
            v-model="newGroup.name"
            type="text"
            placeholder="Введите название группы"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
            id="description"
            v-model="newGroup.description"
            rows="3"
            placeholder="Опишите назначение группы"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="maxParticipants">Максимум участников</label>
          <input
            id="maxParticipants"
            v-model.number="newGroup.maxParticipants"
            type="number"
            min="0"
            placeholder="0 = без ограничений"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading.addGroup">
            {{ loading.addGroup ? 'Создание...' : 'Создать' }}
          </button>
          <button 
            type="button" 
            @click="showGroupModal = false"
            :disabled="loading.addGroup"
          >
            Отмена
          </button>
        </div>
      </form>
    </ModalItem>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ParticipantList } from '../components/participants';
import { GroupList } from '../components/groups';
import { useStore } from '../store/useStore';
import type { Participant, Group } from '../types';
import ModalItem from './ModalItem.vue';

const store = useStore();

const participants = computed(() => store.state.value.participants);
const groups = computed(() => store.state.value.groups);
const loading = computed(() => store.state.value.loading);

// App states
const selectedParticipantId = ref<string | null>(null);

// Modal states
const showParticipantModal = ref(false);
const showGroupModal = ref(false);

// Form states
const newParticipant = ref({
  name: '',
  email: '',
  phone: '',
  groupId: ''
});

const newGroup = ref({
  name: '',
  description: '',
  maxParticipants: 0,
  participants: [] as string[]
});

onMounted(() => {
  store.loadData();
});

// Participants handlers
const handleParticipantAdd = async () => {
  if (!newParticipant.value.name || !newParticipant.value.email) return;

  try {
    await store.addParticipant({
      ...newParticipant.value,
    });
    
    showParticipantModal.value = false;
    newParticipant.value = {
      name: '',
      email: '',
      phone: '',
      groupId: ''
    };
  } catch (err) {
    console.error('Error adding participant:', err);
  }
};

const handleAddParticipant = async (participant: Omit<Participant, 'id'>) => {
  try {
    await store.addParticipant(participant);
  } catch (err) {
    console.error('Error adding participant:', err);
  }
};

const handleUpdateParticipant = async (id: string, updates: Partial<Participant>) => {
  try {
    await store.updateParticipant(id, updates);
  } catch (err) {
    console.error('Error updating participant:', err);
  }
};

const handleRemoveParticipant = async (id: string) => {
  try {
    await store.deleteParticipant(id);
  } catch (err) {
    console.error('Error removing participant:', err);
  }
};

// Groups handlers
const handleGroupAdd = async () => {
  if (!newGroup.value.name) return;

  try {
    await store.addGroup({
      ...newGroup.value,
    });

    showGroupModal.value = false;
    newGroup.value = {
      name: '',
      description: '',
      maxParticipants: 0,
      participants: []
    };
  } catch (err) {
    console.error('Error adding group:', err);
  }
};

const handleUpdateGroup = async (id: string, updates: Partial<Group>) => {
  try {
    await store.updateGroup(id, updates);
  } catch (err) {
    console.error('Error updating group:', err);
  }
};

const handleRemoveGroup = async (id: string) => {
  try {
    await store.deleteGroup(id);
  } catch (err) {
    console.error('Error removing group:', err);
  }
};

const handleDropParticipant = async (event: DragEvent, groupId: string) => {
  if (!event.dataTransfer) return;

  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    if (!data.participantId) return;

    const group = groups.value.find(g => g.id === groupId);
    if (!group) return;

    // Проверяем ограничение на количество участников
    if (group.maxParticipants && 
        group.participants && 
        group.participants.length >= group.maxParticipants) {
      alert('Достигнуто максимальное количество участников в группе');
      return;
    }

    // Обновляем группу в store
    await store.updateGroup(groupId, {
      participants: [...(group.participants || []), data.participantId]
    });
  } catch (error) {
    console.error('Error dropping participant:', error);
  }
};
</script>

<style scoped>
.view-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.grid-layout {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.action-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #45a049;
}

.participants-section,
.groups-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
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
  margin-top: 24px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-actions button[type="submit"] {
  background-color: #4CAF50;
  color: white;
}

.form-actions button[type="submit"]:hover {
  background-color: #45a049;
}

.form-actions button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.form-actions button[type="button"] {
  background-color: #f5f5f5;
}

.form-actions button[type="button"]:hover {
  background-color: #e8e8e8;
}

.form-actions button[type="button"]:disabled {
  background-color: #eeeeee;
  cursor: not-allowed;
}

@media (min-width: 1200px) {
  .grid-layout {
    grid-template-columns: 1fr 2fr;
  }
}
</style>