import { ref, computed, onUnmounted } from "vue";
import {
  ref as dbRef,
  set,
  remove,
  onValue,
  push,
  update,
  serverTimestamp,
  type DatabaseReference,
  type DataSnapshot,
} from "firebase/database";
import { db } from "../firebase/config";
import type { Participant, Group } from "../types";

interface State {
  participants: Participant[];
  groups: Group[];
  loading: {
    participants: boolean;
    groups: boolean;
    addParticipant: boolean;
    addGroup: boolean;
    save: boolean;
  };
  error: {
    code?: string;
    message: string;
  } | null;
}

/**
 * A composable that provides reactive access to participants and groups data
 */
export function useStore() {
  const state = ref<State>({
    participants: [],
    groups: [],
    loading: {
      participants: false,
      groups: false,
      addParticipant: false,
      addGroup: false,
      save: false,
    },
    error: null,
  });

  // References to database nodes
  const participantsRef = dbRef(db, "participants");
  const groupsRef = dbRef(db, "groups");

  // Unsubscribe functions for cleanup
  const unsubscribers: (() => void)[] = [];

  // Firebase operations
  const loadData = async () => {
    state.value.loading.participants = true;
    state.value.loading.groups = true;
    state.value.error = null;

    try {
      // Subscribe to participants changes
      const unsubParticipants = onValue(
        participantsRef,
        (snapshot: DataSnapshot) => {
          const data = snapshot.val() as Record<
            string,
            Omit<Participant, "id">
          > | null;
          state.value.participants = data
            ? Object.entries(data).map(([id, participant]) => ({
                id,
                ...participant,
                createdAt: participant.createdAt
                  ? new Date(participant.createdAt)
                  : new Date(),
                updatedAt: participant.updatedAt
                  ? new Date(participant.updatedAt)
                  : new Date(),
              }))
            : [];
          state.value.loading.participants = false;
        },
        (error) => {
          state.value.error = {
            code: "LOAD_PARTICIPANTS_ERROR",
            message: "Ошибка при загрузке участников",
          };
          state.value.loading.participants = false;
        }
      );

      // Subscribe to groups changes
      const unsubGroups = onValue(
        groupsRef,
        (snapshot: DataSnapshot) => {
          const data = snapshot.val() as Record<
            string,
            Omit<Group, "id">
          > | null;
          state.value.groups = data
            ? Object.entries(data).map(([id, group]) => ({
                id,
                ...group,
                participants: group.participants || [],
                createdAt: group.createdAt
                  ? new Date(group.createdAt)
                  : new Date(),
                updatedAt: group.updatedAt
                  ? new Date(group.updatedAt)
                  : new Date(),
              }))
            : [];
          state.value.loading.groups = false;
        },
        (error) => {
          state.value.error = {
            code: "LOAD_GROUPS_ERROR",
            message: "Ошибка при загрузке групп",
          };
          state.value.loading.groups = false;
        }
      );

      unsubscribers.push(unsubParticipants, unsubGroups);
    } catch (err) {
      console.error("Error loading data:", err);
      state.value.error = {
        code: "LOAD_ERROR",
        message: "Ошибка при загрузке данных",
      };
    }
  };

  const addParticipant = async (
    participant: Omit<Participant, "id" | "createdAt" | "updatedAt">
  ) => {
    state.value.loading.addParticipant = true;
    state.value.error = null;

    try {
      const newParticipantRef = push(participantsRef);
      await set(newParticipantRef, {
        ...participant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      state.value.loading.addParticipant = false;
    } catch (err) {
      console.error("Error adding participant:", err);
      state.value.error = {
        code: "ADD_PARTICIPANT_ERROR",
        message: "Ошибка при добавлении участника",
      };
      state.value.loading.addParticipant = false;
    }
  };

  const updateParticipant = async (
    id: string,
    participant: Partial<Omit<Participant, "id">>
  ) => {
    state.value.loading.save = true;
    state.value.error = null;

    try {
      const updates = {
        ...participant,
        updatedAt: serverTimestamp(),
      };
      await update(dbRef(db, `participants/${id}`), updates);
      state.value.loading.save = false;
    } catch (err) {
      console.error("Error updating participant:", err);
      state.value.error = {
        code: "UPDATE_PARTICIPANT_ERROR",
        message: "Ошибка при обновлении участника",
      };
      state.value.loading.save = false;
    }
  };

  const deleteParticipant = async (id: string) => {
    state.value.error = null;

    try {
      await remove(dbRef(db, `participants/${id}`));

      // Update groups that contain this participant
      const groupsWithParticipant = state.value.groups.filter((group) =>
        group.participants.includes(id)
      );

      for (const group of groupsWithParticipant) {
        if (group.id) {
          const updatedParticipants = group.participants.filter(
            (pId) => pId !== id
          );
          await update(dbRef(db, `groups/${group.id}`), {
            participants: updatedParticipants,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      console.error("Error deleting participant:", err);
      state.value.error = {
        code: "DELETE_PARTICIPANT_ERROR",
        message: "Ошибка при удалении участника",
      };
    }
  };

  const addGroup = async (
    group: Omit<Group, "id" | "createdAt" | "updatedAt">
  ) => {
    state.value.loading.addGroup = true;
    state.value.error = null;

    try {
      const newGroupRef = push(groupsRef);
      await set(newGroupRef, {
        ...group,
        participants: group.participants || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      state.value.loading.addGroup = false;
    } catch (err) {
      console.error("Error adding group:", err);
      state.value.error = {
        code: "ADD_GROUP_ERROR",
        message: "Ошибка при создании группы",
      };
      state.value.loading.addGroup = false;
    }
  };

  const updateGroup = async (id: string, group: Partial<Omit<Group, "id">>) => {
    state.value.loading.save = true;
    state.value.error = null;

    try {
      const updates = {
        ...group,
        updatedAt: serverTimestamp(),
      };
      await update(dbRef(db, `groups/${id}`), updates);
      state.value.loading.save = false;
    } catch (err) {
      console.error("Error updating group:", err);
      state.value.error = {
        code: "UPDATE_GROUP_ERROR",
        message: "Ошибка при обновлении группы",
      };
      state.value.loading.save = false;
    }
  };

  const deleteGroup = async (id: string) => {
    state.value.error = null;

    try {
      // First update all participants in this group
      const participantsInGroup = state.value.participants.filter(
        (p) => p.groupId === id
      );

      for (const participant of participantsInGroup) {
        if (participant.id) {
          await update(dbRef(db, `participants/${participant.id}`), {
            groupId: null,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Then delete the group
      await remove(dbRef(db, `groups/${id}`));
    } catch (err) {
      console.error("Error deleting group:", err);
      state.value.error = {
        code: "DELETE_GROUP_ERROR",
        message: "Ошибка при удалении группы",
      };
    }
  };

  // Computed properties
  const ungroupedParticipants = computed(() => {
    return state.value.participants.filter((p) => !p.groupId);
  });

  const getGroupParticipants = (groupId: string) => {
    return computed(() => {
      return state.value.participants.filter((p) => p.groupId === groupId);
    });
  };

  const getGroup = (groupId: string) => {
    return computed(() => {
      return state.value.groups.find((g) => g.id === groupId);
    });
  };

  // Cleanup subscriptions on component unmount
  onUnmounted(() => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  });

  return {
    state,
    loadData,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addGroup,
    updateGroup,
    deleteGroup,
    ungroupedParticipants,
    getGroupParticipants,
    getGroup,
  };
}
