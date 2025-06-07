<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Participant, Group } from '../../types'

const props = defineProps<{
  participant: Participant;
  groups: Group[];
  isSelected?: boolean;
}>()

const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'update', id: string, updates: Partial<Participant>): void;
  (e: 'dragstart', event: DragEvent, participant: Participant): void;
  (e: 'click', participant: Participant): void;
}>()

const isEditing = ref(false)
const editedParticipant = ref({ ...props.participant })

// Проверяем, находится ли участник в какой-либо группе
const isInGroups = computed(() => {
  return props.groups.some(group => 
    group.participants?.includes(props.participant.id || '')
  )
})

// Получаем названия групп, в которых состоит участник
const participantGroups = computed(() => {
  return props.groups
    .filter(group => group.participants?.includes(props.participant.id || ''))
    .map(group => group.name)
    .join(', ')
})

const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({
      participantId: props.participant.id,
      participant: props.participant
    }));
    event.dataTransfer.effectAllowed = 'move';
  }
  emit('dragstart', event, props.participant)
}

const handleClick = () => {
  emit('click', props.participant)
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
    :class="{
      'in-groups': isInGroups,
      'selected': isSelected
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @click="handleClick"
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
        <p v-if="isInGroups" class="groups">Группы: {{ participantGroups }}</p>
      </div>
      <div class="actions">
        <button @click.stop="isEditing = true" class="edit">
          Редактировать
        </button>
        <button @click.stop="handleRemove" class="delete">
          Удалить
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.participant-item {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: white;
  cursor: grab;
  transition: all 0.3s ease;
}

.participant-item.in-groups {
  border-color: #4CAF50;
  background-color: #f1f8e9;
}

.participant-item.selected {
  border-color: #2196F3;
  background-color: #e3f2fd;
  box-shadow: 0 0 0 2px #2196F3;
}

.participant-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.groups {
  margin: 0.25rem 0 0 0;
  color: #4CAF50;
  font-size: 0.9em;
  font-style: italic;
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

@media (max-width: 520px) {
  .participant-item {
    padding: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .info h3 {
    font-size: 0.95em;
    margin-bottom: 0.25rem;
  }

  .info .email,
  .info .phone,
  .info .groups {
    font-size: 0.85em;
  }

  .actions {
    margin-top: 0.5rem;
  }

  .actions button {
    padding: 0.3rem 0.6rem;
    font-size: 0.85em;
  }
  /* Оптимизируем размеры кнопок */
  .actions button {
    min-width: 25px;
    min-height: 25px;
    padding: 4px 6px;
    font-size: 0.6em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Уменьшаем отступы для компактности */
  .actions {
    gap: 0.25rem;
    margin-top: 0.5rem;
  }

  /* Делаем текст в кнопках компактнее */
  .edit, .delete, .save, .cancel {
    white-space: nowrap;
  }

  /* Уменьшаем поля ввода */
  .form-group input {
    padding: 4px 8px;
    font-size: 0.9em;
  }
}
</style>