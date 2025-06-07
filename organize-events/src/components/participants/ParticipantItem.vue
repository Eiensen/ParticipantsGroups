<script setup lang="ts">
import { ref } from 'vue'
import type { Participant } from '../../types'

const props = defineProps<{
  participant: Participant
}>()

const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'update', id: string, updates: Partial<Participant>): void
  (e: 'dragstart', event: DragEvent, participant: Participant): void
}>()

const isEditing = ref(false)
const editedParticipant = ref({ ...props.participant })

const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    // Передаем ID участника
    event.dataTransfer.setData('application/json', JSON.stringify({
      participantId: props.participant.id,
      participant: props.participant
    }));
    event.dataTransfer.effectAllowed = 'move';
  }
}

const handleSubmit = () => {
  if (props.participant.id) {
    emit('update', props.participant.id, {
      name: editedParticipant.value.name,
      email: editedParticipant.value.email,
      phone: editedParticipant.value.phone,
    })
  }
  isEditing.value = false
}

const handleRemove = () => {
  if (props.participant.id) {
    emit('remove', props.participant.id)
  }
}

const cancelEdit = () => {
  editedParticipant.value = { ...props.participant }
  isEditing.value = false
}
</script>

<template>
  <div 
    class="participant-item"
    draggable="true"
    @dragstart="handleDragStart"
    data-testid="participant-item"
  >
    <template v-if="isEditing">
      <form @submit.prevent="handleSubmit" class="edit-form">
        <div class="form-group">
          <input
            v-model="editedParticipant.name"
            type="text"
            placeholder="Имя"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="editedParticipant.email"
            type="email"
            placeholder="Email"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="editedParticipant.phone"
            type="tel"
            placeholder="Телефон"
          />
        </div>
        <div class="actions">
          <button type="submit" class="save">Сохранить</button>
          <button type="button" @click="cancelEdit" class="cancel">Отмена</button>
        </div>
      </form>
    </template>
    
    <template v-else>
      <div class="info">
        <h3>{{ participant.name }}</h3>
        <p class="email">{{ participant.email }}</p>
        <p v-if="participant.phone" class="phone">{{ participant.phone }}</p>
      </div>
      <div class="actions">
        <button @click="isEditing = true" class="edit">
          Редактировать
        </button>
        <button @click="handleRemove" class="delete">
          Удалить
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.participant-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: white;
  cursor: grab;
  transition: background-color 0.2s, transform 0.2s;
}

.participant-item:hover {
  background-color: #f9f9f9;
}

.participant-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1em;
}

.info .email {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}

.info .phone {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9em;
}

button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.9;
}

.edit {
  background-color: #4CAF50;
  color: white;
}

.delete {
  background-color: #ff4444;
  color: white;
}

.save {
  background-color: #4CAF50;
  color: white;
}

.cancel {
  background-color: #f5f5f5;
}
</style>