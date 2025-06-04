<script setup lang="ts">
import { onMounted, computed, CSSProperties } from "vue";
import { useStore } from "./store/useStore";
import type { Group, Participant } from "./types/index.ts";
import type { StoreRefs } from "./types/vue";
import { ParticipantList } from "./components/participants";
import { GroupList } from "./components/groups";

// Get store and destructure with proper typing
const store = useStore();
const {
  participants,
  groups,
  newParticipantName,
  showGroupModal,
  selectedParticipant,
  selectedGroups,
  modalPosition,
  loadData,
  saveParticipants,
  addParticipant,
  removeParticipant,
  addGroup,
  removeGroup,
  removeFromGroup,
  isInAnyGroup,
  getParticipantName,
  showGroupSelection,
  closeModal,
  assignToGroups,
  startDrag,
  dropOnGroup,
  loading,
  error
} = store as unknown as StoreRefs & typeof store;

// Compute available groups for selection
const availableGroups = computed<Group[]>(() => groups.value);

// Computed style binding for modal
const modalStyleBinding = computed<CSSProperties>(() => ({
  top: modalPosition.value.top,
  left: modalPosition.value.left
}));

// Event handlers with proper typing
const handleDropOnGroup = (event: DragEvent, group: Group) => {
  event.preventDefault();
  dropOnGroup(event, group);
};

const handleStartDrag = (event: DragEvent, participant: Participant) => {
  startDrag(event, participant);
};

// Render function for group content
const renderGroupContent = (group: Group) => {
  return {
    template: `
      <div class="group-participants">
        <div v-for="participantId in group.participants"
             :key="participantId"
             class="group-participant">
          {{ getParticipantName(participantId) }}
          <span class="remove-from-group"
                @click="() => removeFromGroup(group.id, participantId)">×</span>
        </div>
      </div>
    `,
    methods: {
      getParticipantName,
      removeFromGroup
    },
    data() {
      return { group };
    }
  };
};

// Load data when component mounts
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="app">
    <div class="container">
      <!-- Error message -->
      <div v-if="error" class="error-message">
        {{ error.message }}
      </div>

      <!-- Loading overlay -->
      <div v-if="loading.participants || loading.groups" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>

      <!-- Left sidebar - Participants list -->
      <ParticipantList
        :participants="participants"
        :newParticipantName="newParticipantName"
        :addParticipant="addParticipant"
        :removeParticipant="removeParticipant"
        :onParticipantSelect="showGroupSelection"
        :onParticipantDragStart="handleStartDrag"
        :isInGroup="isInAnyGroup"
        :loading="loading.addParticipant"
      />

      <!-- Main area - Groups -->
      <div class="groups-area">
        <div class="groups-actions">
          <button @click="addGroup" class="add-group-btn" :disabled="loading.addGroup">
            {{ loading.addGroup ? 'Создание...' : 'Добавить функциональную группу' }}
          </button>
          <button @click="saveParticipants" class="save-btn" :disabled="loading.save">
            {{ loading.save ? 'Сохранение...' : 'Сохранить проект' }}
          </button>
        </div>

        <GroupList
          :groups="groups"
          :onRemoveGroup="removeGroup"
          :onDropOnGroup="handleDropOnGroup"
          :renderGroupContent="renderGroupContent"
        />
      </div>

      <!-- Group Selection Modal -->
      <div v-if="showGroupModal" class="modal-right" :style="modalStyleBinding">
        <div class="modal-content">
          <span class="close-btn" @click="closeModal">×</span>
          <h3>Добавить {{ selectedParticipant?.name }} в группы</h3>
          <div class="group-checkboxes">
            <div
              v-for="group in availableGroups"
              :key="group.id"
              class="group-checkbox"
            >
              <input
                type="checkbox"
                :id="'group-' + group.id"
                :value="group.id"
                v-model="selectedGroups"
              />
              <label :for="'group-' + group.id">{{ group.name }}</label>
            </div>
          </div>
          <button @click="assignToGroups" class="assign-btn">Добавить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.app {
  font-family: Arial, sans-serif;
  height: 100vh;
  display: flex;
}

.container {
  display: flex;
  width: 100%;
}

.groups-area {
  flex: 1;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
}

.groups-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-group-btn,
.save-btn {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.add-group-btn:hover,
.save-btn:hover {
  background-color: #45a049;
}

.group-participants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.group-participant {
  background-color: white;
  border: 1px solid #ddd;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.remove-from-group {
  cursor: pointer;
  color: red;
  margin-left: 15px;
}

.highlight-group {
  box-shadow: 0 0 0 2px #4caf50;
}

.highlight-error-participant {
  box-shadow: 0 0 0 2px #e44e4e;
}

.modal-right {
  height: max-content;
  position: fixed;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  width: 250px;
}

.modal-content {
  padding: 15px;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  font-size: 18px;
}

.group-checkboxes {
  margin: 20px 0;
  max-height: 300px;
  overflow-y: auto;
}

.group-checkbox {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.group-checkbox input {
  margin-right: 10px;
}

.assign-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.assign-btn:hover {
  background-color: #45a049;
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
  border-top: 4px solid #4caf50;
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

.add-group-btn:disabled,
.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
