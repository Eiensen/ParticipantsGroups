<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useStore } from "./store/useStore";
import type { Group } from "./types";
import { ParticipantList } from "./components/participants";
import { GroupList } from "./components/groups";
import ModalItem from "./views/ModalItem.vue";

const store = useStore();
const {
  state,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  addGroup,
  updateGroup,
  deleteGroup,
  loadData
} = store;

const loading = computed(() => state.value.loading);
const error = computed(() => state.value.error);
const participants = computed(() => state.value.participants);
const groups = computed(() => state.value.groups);

// Load data when component mounts
onMounted(() => {
  loadData();
});

// Modal state for new participant
const showParticipantModal = ref(false);
const newParticipant = ref({
  name: '',
  email: '',
  phone: '',
  groupId: ''
});

// Modal state for new group
const showGroupModal = ref(false);
const newGroup = ref({
  name: '',
  description: '',
  maxParticipants: 0,
  participants: [] as string[]
});

// Handlers
const handleAddParticipant = () => {
  if (!newParticipant.value.name || !newParticipant.value.email) return;

  addParticipant({
    ...newParticipant.value,
  });
  
  showParticipantModal.value = false;
  newParticipant.value = {
    name: '',
    email: '',
    phone: '',
    groupId: ''
  };
};

const handleAddGroup = () => {
  if (!newGroup.value.name) return;

  addGroup({
    ...newGroup.value,
  });

  showGroupModal.value = false;
  newGroup.value = {
    name: '',
    description: '',
    maxParticipants: 0,
    participants: []
  };
};

const handleDropOnGroup = (event: DragEvent, groupId: string) => {
  const participantId = event.dataTransfer?.getData('text/plain');
  if (!participantId) return;

  const group = state.value.groups.find(g => g.id === groupId);
  if (!group) return;

  updateGroup(groupId, {
    participants: [...(group.participants || []), participantId]
  });
};

// Compute available groups for selection
const availableGroups = computed<Group[]>(() => state.value.groups);

// Computed style binding for modal
// const modalStyleBinding = computed<CSSProperties>(() => ({
//   top: modalPosition.value.top,
//   left: modalPosition.value.left
// }));
</script>

<template>
  <div class="app">
    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error.message }}
    </div>

    <!-- Loading overlay -->
    <div v-if="loading.participants || loading.groups" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Загрузка...</p>
    </div>

    <div class="container">
      <!-- Header section -->
      <header class="header">
        <h1>Управление участниками и группами</h1>
        <div class="header-actions">
          <button 
            @click="showParticipantModal = true"
            class="action-button"
          >
            Добавить участника
          </button>
          <button 
            @click="showGroupModal = true"
            class="action-button"
          >
            Создать группу
          </button>
        </div>
      </header>

      <!-- Main content -->
      <main class="main-content">
        <div class="participants-section">
          <ParticipantList
            :participants="participants"
            :loading="loading.participants"
            @remove="deleteParticipant"
            @update="updateParticipant"
          />
        </div>

        <div class="groups-section">
          <GroupList
            :groups="groups"
            :participants="participants"
            :loading="loading.groups"
            @remove="deleteGroup"
            @update="updateGroup"
            @drop="handleDropOnGroup"
          />
        </div>
      </main>
    </div>

    <!-- New Participant Modal -->
    <ModalItem
      v-if="showParticipantModal"
      @close="showParticipantModal = false"
    >
      <template #header>
        <h3>Добавить участника</h3>
      </template>

      <form @submit.prevent="handleAddParticipant">
        <div class="form-group">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="newParticipant.name"
            type="text"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="newParticipant.email"
            type="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Телефон</label>
          <input
            id="phone"
            v-model="newParticipant.phone"
            type="tel"
          />
        </div>

        <div class="form-actions">
          <button type="submit">Добавить</button>
          <button type="button" @click="showParticipantModal = false">
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

      <form @submit.prevent="handleAddGroup">
        <div class="form-group">
          <label for="groupName">Название</label>
          <input
            id="groupName"
            v-model="newGroup.name"
            type="text"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
            id="description"
            v-model="newGroup.description"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="maxParticipants">Максимум участников</label>
          <input
            id="maxParticipants"
            v-model.number="newGroup.maxParticipants"
            type="number"
            min="0"
          />
        </div>

        <div class="form-actions">
          <button type="submit">Создать</button>
          <button type="button" @click="showGroupModal = false">
            Отмена
          </button>
        </div>
      </form>
    </ModalItem>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.5em;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 12px;
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

.main-content {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (min-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr 2fr;
  }
}

.participants-section,
.groups-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.form-actions button[type="button"] {
  background-color: #f5f5f5;
}

.form-actions button[type="button"]:hover {
  background-color: #e8e8e8;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #ff4444;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
