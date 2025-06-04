<script setup lang="ts">
import { defineProps, PropType } from 'vue';
import { Participant } from '../../types';

const props = defineProps({
  participant: {
    type: Object as PropType<Participant>,
    required: true
  },
  isInGroup: {
    type: Boolean,
    default: false
  },
  onRemove: {
    type: Function as PropType<(id: number) => void>,
    required: false
  },
  onSelect: {
    type: Function as PropType<(participant: Participant, event: MouseEvent) => void>,
    required: false
  },
  onDragStart: {
    type: Function as PropType<(event: DragEvent, participant: Participant) => void>,
    required: false
  }
});

const handleDragStart = (event: DragEvent) => {
  props.onDragStart?.(event, props.participant);
};

const handleSelect = (event: MouseEvent) => {
  props.onSelect?.(props.participant, event);
};

const handleRemove = (event: MouseEvent) => {
  event.stopPropagation();
  props.onRemove?.(props.participant.id);
};
</script>

<template>
  <div
    class="participant-item"
    :class="{ 'in-group': isInGroup }"
    :data-id="participant.id"
    data-testid="participant-item"
    draggable="true"
    @dragstart="handleDragStart"
    @click="handleSelect"
  >
    {{ participant.name }}
    <span
      v-if="onRemove"
      class="delete-btn"
      @click="handleRemove"
    >
      ×
    </span>
  </div>
</template>

<style scoped>
.participant-item {
  background-color: white;
  border: 1px solid #ddd;
  padding: 10px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: move;
}

.participant-item.in-group {
  background-color: #e6ffe6;
}

.delete-btn {
  cursor: pointer;
  color: red;
  font-size: 18px;
}
</style>