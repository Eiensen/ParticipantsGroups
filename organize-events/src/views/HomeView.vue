<template>
  <div class="view-wrapper">
    <div class="grid-layout">      <div class="participants-section">
        <ParticipantList 
          :participants="participants" 
          :loading="loading.participants"
          @add="handleAddParticipant"
          @update="handleUpdateParticipant"
          @remove="handleRemoveParticipant"
        />
      </div>

      <div class="groups-section">
        <GroupList 
          :groups="groups"
          :participants="participants"
          :loading="loading.groups"
          @update="handleUpdateGroup"
          @remove="handleRemoveGroup"
          @drop="handleDropParticipant"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { ParticipantList } from '../components/participants';
import { GroupList } from '../components/groups';
import { useStore } from '../store/useStore';
import type { Participant, Group } from '../types';

const store = useStore();

const participants = computed(() => store.state.value.participants);
const groups = computed(() => store.state.value.groups);
const loading = computed(() => store.state.value.loading);

onMounted(() => {
  store.loadData();
});

// Participants handlers
const handleAddParticipant = (participant: Omit<Participant, 'id'>) => {
  store.addParticipant(participant);
};

const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
  store.updateParticipant(id, updates);
};

const handleRemoveParticipant = (id: string) => {
  store.deleteParticipant(id);
};

// Groups handlers
const handleUpdateGroup = (id: string, updates: Partial<Group>) => {
  store.updateGroup(id, updates);
};

const handleRemoveGroup = (id: string) => {
  store.deleteGroup(id);
};

const handleDropParticipant = (event: DragEvent, groupId: string) => {
  const participantId = event.dataTransfer?.getData('text/plain');
  if (!participantId) return;

  const group = groups.value.find(g => g.id === groupId);
  if (!group) return;

  store.updateGroup(groupId, {
    participants: [...(group.participants || []), participantId]
  });
};
</script>

<style scoped>
.view-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.grid-layout {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (min-width: 1200px) {
  .grid-layout {
    grid-template-columns: 1fr 2fr;
  }
}

.participants-section,
.groups-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
</style>