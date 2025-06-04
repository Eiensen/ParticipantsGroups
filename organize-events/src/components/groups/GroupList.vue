<script setup lang="ts">
import { defineProps } from 'vue';
import GroupItem from './GroupItem.vue';
import { Group } from '../../types';

interface Props {
  groups: Group[];
  onRemoveGroup?: (groupId: number) => void;
  onDropOnGroup?: (event: DragEvent, group: Group) => void;
  renderGroupContent?: (group: Group) => any;
}

const props = defineProps<Props>();

const handleDropOnGroup = (event: DragEvent, group: Group) => {
  props.onDropOnGroup?.(event, group);
};
</script>

<template>
  <div class="groups-container">
    <GroupItem
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :onRemove="onRemoveGroup"
      :onDrop="(event: DragEvent) => handleDropOnGroup(event, group)"
    >
      <template v-if="renderGroupContent">
        <component :is="renderGroupContent(group)" />
      </template>
    </GroupItem>
  </div>
</template>

<style scoped>
.groups-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>