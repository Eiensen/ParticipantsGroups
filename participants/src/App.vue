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
            @click="selectParticipant(participant.id)"
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
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    // Data
    const participants = ref([
      { id: 1, name: 'Иванов Иван Иванович' },
      { id: 2, name: 'Петров Петр Петрович' },
      { id: 3, name: 'Сидорова Анна Михайловна' },
    ])

    const groups = ref([
      { id: 1, name: 'Группа 1', participants: [1, 2] },
      { id: 2, name: 'Группа 2', participants: [2, 3] },
    ])

    const newParticipantName = ref('')
    const nextParticipantId = ref(4)
    const nextGroupId = ref(3)
    const draggedParticipant = ref(null)
    const selectedParticipantId = ref(null)

    // Computed
    const participantGroups = computed(() => {
      const map = {}
      participants.value.forEach((p) => {
        map[p.id] = groups.value.filter((g) => g.participants.includes(p.id)).map((g) => g.id)
      })
      return map
    })

    // Methods
    const addParticipant = () => {
      if (newParticipantName.value.trim()) {
        participants.value.push({
          id: nextParticipantId.value++,
          name: newParticipantName.value.trim(),
        })
        newParticipantName.value = ''
      }
    }

    const removeParticipant = (id) => {
      // Remove from all groups first
      groups.value.forEach((group) => {
        group.participants = group.participants.filter((pid) => pid !== id)
      })
      // Then remove from participants list
      participants.value = participants.value.filter((p) => p.id !== id)
    }

    const addGroup = () => {
      const groupName = prompt('Введите название группы')
      if (groupName) {
        groups.value.push({
          id: nextGroupId.value++,
          name: groupName,
          participants: [],
        })
      }
    }

    const removeGroup = (id) => {
      groups.value = groups.value.filter((g) => g.id !== id)
    }

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

    const removeFromGroup = (groupId, participantId) => {
      const group = groups.value.find((g) => g.id === groupId)
      if (group) {
        group.participants = group.participants.filter((id) => id !== participantId)
      }
    }

    const isInAnyGroup = (participantId) => {
      return groups.value.some((g) => g.participants.includes(participantId))
    }

    const getGroupsForParticipant = (participantId) => {
      return groups.value.filter((g) => g.participants.includes(participantId))
    }

    const getParticipantName = (id) => {
      const p = participants.value.find((p) => p.id === id)
      return p ? p.name : ''
    }

    const selectParticipant = (id) => {
      selectedParticipantId.value = id
    }

    const getArrowStyle = (participantId, groupId) => {
      // This is a simplified version - in a real app you'd need to calculate
      // the actual positions of elements for proper arrow drawing
      return {
        backgroundColor: 'green',
        height: '2px',
        position: 'absolute',
        transform: 'rotate(45deg)',
      }
    }

    return {
      participants,
      groups,
      newParticipantName,
      participantGroups,
      selectedParticipantId,
      addParticipant,
      removeParticipant,
      addGroup,
      removeGroup,
      startDrag,
      dropOnGroup,
      removeFromGroup,
      isInAnyGroup,
      getGroupsForParticipant,
      getParticipantName,
      selectParticipant,
      getArrowStyle,
    }
  },
}
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
</style>
