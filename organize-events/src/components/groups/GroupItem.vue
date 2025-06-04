<script setup lang="ts">
import { defineProps } from 'vue';
import type { Group } from '../../types';

interface Props {
  group: Group;
  onRemove?: (groupId: number) => void;
  onDrop?: (event: DragEvent) => void;
}

const props = defineProps<Props>();

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  props.onDrop?.(event);
};

const handleRemove = () => {
  props.onRemove?.(props.group.id);
};
</script>

<template>
  <div 
    class="group"
    :data-id="group.id"
    data-testid="group-item"
    @dragover.prevent
    @drop="handleDrop"
  >
    <h3>{{ group.name }}</h3>
    <span 
      v-if="onRemove"
      class="group-delete-btn" 
      @click="handleRemove"
    >
      X
    </span>
    <slot></slot>
  </div>
</template>

<style scoped>
.group {
  max-width: 60vw;
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  position: relative;
}

.group h3 {
  margin-top: 0;
}

.group-delete-btn {
  right: 10px;
  top: 10px;
  font-size: 18px;
  position: absolute;
  cursor: pointer;
  color: red;
}
</style>