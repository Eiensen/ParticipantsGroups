<template>
  <div class="app">
    <div class="container">
      <!-- Left sidebar - Participants list -->
      <div class="participants-sidebar">
        <h2>Участники</h2>
        <div class="add-participant">
          <input
            v-model="newParticipantName"
            @keyup.enter="addParticipant"
            placeholder="Введите ФИО"
          />
          <button @click="addParticipant">Добавить</button>
        </div>
        <div class="participants-list">
          <div
            v-for="participant in participants"
            :key="participant.id"
            class="participant-item"
            :class="{ 'in-group': isInAnyGroup(participant.id) }"
            draggable="true"
            @dragstart="startDrag($event, participant)"
            @click.stop="showGroupSelection(participant, $event)"
            ref='participantElements'
          >
            <span class="delete-btn" @click.stop="removeParticipant(participant.id)">×</span>
            {{ participant.name }}
            <div
              v-for="group in getGroupsForParticipant(participant.id)"
              :key="group.id"
              class="group-arrow"
              :style="getArrowStyle(participant.id, group.id)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main area - Groups -->
      <div class="groups-area">
        <button @click="addGroup" class="add-group-btn">Добавить функциональную группу</button>
        <div class="groups-container" @dragover.prevent @drop="dropOnGroup">
          <div
            v-for="group in groups"
            :key="group.id"
            class="group"
            :data-id="group.id"
            @dragover.prevent
            @drop="dropOnGroup($event, group)"
          >
            <span class="delete-btn" @click="removeGroup(group.id)">×</span>
            <h3>{{ group.name }}</h3>
            <div class="group-participants">
              <div
                v-for="participantId in group.participants"
                :key="participantId"
                class="group-participant"
              >
                {{ getParticipantName(participantId) }}
                <span class="remove-from-group" @click="removeFromGroup(group.id, participantId)">
                  ×
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Group Selection Modal -->
      <div v-if="showGroupModal" class="modal-right" :style="modalPosition">
        <div class="modal-content">
          <span class="close-btn" @click="closeModal">×</span>
          <h3>Добавить {{ selectedParticipant?.name }} в группы</h3>
          <div class="group-checkboxes">
            <div v-for="group in availableGroups" :key="group.id" class="group-checkbox">
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
<script setup>
import { ref, onMounted  } from 'vue'
import { useStore } from './useStore'

const {
  participants,
  groups,
  newParticipantName,
  showGroupModal,
  selectedParticipant,
  selectedGroups,
  modalPosition,
  loadData,
  addParticipant,
  removeParticipant,
  addGroup,
  removeGroup,
  removeFromGroup,
  isInAnyGroup,
  getGroupsForParticipant,
  getParticipantName,
  showGroupSelection,
  closeModal,
  assignToGroups
} = useStore()

// Load data when component mounts
onMounted(() => {
  loadData()
})

// Data
// const participants = ref([
//   { id: 1, name: 'Иванов Иван Иванович' },
//   { id: 2, name: 'Петров Петр Петрович' },
//   { id: 3, name: 'Сидорова Анна Михайловна' },
// ])

// const groups = ref([
//   { id: 1, name: 'Группа 1', participants: [1, 2] },
//   { id: 2, name: 'Группа 2', participants: [2, 3] },
// ])


// const nextParticipantId = ref(4)
// const nextGroupId = ref(3)
const draggedParticipant = ref(null)
// const showGroupModal = ref(false)
// const selectedParticipant = ref(null)
// const selectedGroups = ref([])
// const modalPosition = ref({ top: '0', left: '0' })
//const participantElements = ref([])

// Computed
// const participantGroups = computed(() => {
//   const map = {}
//   participants.value.forEach((p) => {
//     map[p.id] = groups.value.filter((g) => g.participants.includes(p.id)).map((g) => g.id)
//   })
//   return map
// })

// Methods
// const availableGroups = computed(() => {
    //   if (!selectedParticipant.value) return groups.value

    //   return groups.value.filter(
    //     (group) => !group.participants.includes(selectedParticipant.value.id),
    //   )
    // })



const startDrag = (event, participant) => {
  draggedParticipant.value = participant
  event.dataTransfer.setData('text/plain', participant.id)
}

const dropOnGroup = (event, group) => {
  if (draggedParticipant.value) {
    if (!group.participants.includes(draggedParticipant.value.id)) {
      group.participants.push(draggedParticipant.value.id)
    }
    draggedParticipant.value = null
  }
}


// const getArrowStyle = () => {
//   // Simplified arrow styling
//   return {
//     backgroundColor: 'green',
//     height: '2px',
//     position: 'absolute',
//     transform: 'rotate(45deg)',
//   }
// }
</script>

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

.participants-sidebar {
  width: 300px;
  padding: 20px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  height: 100vh;
  overflow-y: auto;
}

.groups-area {
  flex: 1;
  padding: 20px;
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
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.participant-item {
  background-color: white;
  border: 1px solid #ddd;
  padding: 10px;
  position: relative;
  cursor: move;
}

.participant-item.in-group {
  background-color: #e6ffe6;
}

.group {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  position: relative;
}

.group h3 {
  margin-top: 0;
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
}

.delete-btn,
.remove-from-group {
  cursor: pointer;
  color: red;
  margin-right: 5px;
}

.delete-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 18px;
}

.remove-from-group {
  margin-left: 5px;
}

.add-group-btn {
  margin-bottom: 20px;
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.add-group-btn:hover {
  background-color: #45a049;
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

.highlight-group {
  box-shadow: 0 0 0 2px #4caf50;
}

.no-groups-message {
  padding: 10px;
  color: #666;
  text-align: center;
}

.assign-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
</style>
