<script setup lang="ts">
import { ref } from 'vue'
import type { Participant } from '../../types'
import ParticipantItem from './ParticipantItem.vue'
import ModalItem from '../../views/ModalItem.vue'

interface Props {
  participants: Participant[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'update', id: string, updates: Partial<Participant>): void
  (e: 'add', participant: Omit<Participant, 'id'>): void
  (e: 'dragstart', event: DragEvent, participant: Participant): void
}>()

const isModalOpen = ref(false)

interface EditingParticipant {
  id?: string
  name: string
  email: string
  phone?: string
  groupId?: string
}

const editingParticipant = ref<EditingParticipant>({
  name: '',
  email: '',
  phone: '',
  groupId: ''
})

const handleRemove = (id: string) => {
  emit('remove', id)
}

const handleUpdate = (id: string, updates: Partial<Participant>) => {
  emit('update', id, updates)
}

const handleDragStart = (event: DragEvent, participant: Participant) => {
  emit('dragstart', event, participant)
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  console.log('Form submitted', editingParticipant.value)
  
  if (!editingParticipant.value.name || !editingParticipant.value.email) {
    console.log('Required fields missing')
    return
  }

  try {
    // if (editingParticipant.value.id) {
    //   // Обновление существующего участника
    //   await handleUpdate(editingParticipant.value.id, {
    //     name: editingParticipant.value.name,
    //     email: editingParticipant.value.email,
    //     phone: editingParticipant.value.phone,
    //   })
    // } else {
      // Добавление нового участника
      emit('add', {
        name: editingParticipant.value.name,
        email: editingParticipant.value.email,
        phone: editingParticipant.value.phone,
      })
    //}
    
    // Закрываем модальное окно и очищаем форму только при успешном выполнении
    isModalOpen.value = false
    resetForm()
  } catch (err) {
    console.error('Error submitting form:', err)
  }
}

// Вспомогательные функции
const resetForm = () => {
  editingParticipant.value = {
    name: '',
    email: '',
    phone: '',
    groupId: ''
  }
}

const openAddModal = () => {
  resetForm()
  isModalOpen.value = true
}

</script>

<template>
  <div class="participants-list">
    <div v-if="loading" class="loading">
      Загрузка участников...
    </div>
    
    <div v-else-if="!participants.length" class="empty-state">
      Нет участников
    </div>
    
    <div v-else class="list">
      <ParticipantItem
        v-for="participant in participants"
        :key="participant.id"
        :participant="participant"
        @remove="handleRemove"
        @update="handleUpdate"
        @dragstart="handleDragStart"
      />
    </div>

    <ModalItem
      v-if="isModalOpen"
      @close="isModalOpen = false"
    >
      <template #header>
        <h3>{{ editingParticipant.id ? 'Редактировать' : 'Добавить' }} участника</h3>
      </template>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="editingParticipant.name"
            type="text"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="editingParticipant.email"
            type="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Телефон</label>
          <input
            id="phone"
            v-model="editingParticipant.phone"
            type="tel"
          />
        </div>        <div class="form-actions">
          <button type="submit" :disabled="loading">
            {{ editingParticipant.id 
              ? (loading ? 'Сохранение...' : 'Сохранить')
              : (loading ? 'Добавление...' : 'Добавить')
            }}
          </button>
          <button type="button" @click="isModalOpen = false" :disabled="loading">
            Отмена
          </button>
        </div>
      </form>
    </ModalItem>
  </div>
</template>

<style scoped>

.add-button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.participants-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.loading,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.form-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #4CAF50;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #f5f5f5;
}

.form-actions button:hover {
  opacity: 0.9;
}
</style>