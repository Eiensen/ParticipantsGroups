import { ref, computed, type Ref, type ComputedRef } from "vue";
import {
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  set,
  onValue,
  type Database,
} from "firebase/database";
import type {
  Participant,
  Group,
  ModalPosition,
  StoreState,
  AppError,
} from "../types";

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAK_TOb75b9U0VDx93GLq1VkpCnzZm-DE4",
  authDomain: "participants-seva.firebaseapp.com",
  projectId: "participants-seva",
  storageBucket: "participants-seva.appspot.com",
  messagingSenderId: "587560809720",
  appId: "1:587560809720:web:87dd4167777a3d799b770d",
  measurementId: "G-MLLV2HH2NH",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Database = getDatabase(app);

interface UseStore {
  // State refs
  participants: Ref<Participant[]>;
  groups: Ref<Group[]>;
  newParticipantName: Ref<string>;
  showGroupModal: Ref<boolean>;
  selectedParticipant: Ref<Participant | null>;
  selectedGroups: Ref<number[]>;
  modalPosition: Ref<ModalPosition>;
  draggedParticipant: Ref<Participant | null>;
  loading: Ref<{
    participants: boolean;
    groups: boolean;
    addParticipant: boolean;
    addGroup: boolean;
    save: boolean;
  }>;
  error: Ref<AppError | null>;

  // Computed refs
  participantGroups: ComputedRef<Record<number, number[]>>;

  // Methods
  loadData: () => Promise<void>;
  saveParticipants: () => Promise<void>;
  saveGroups: () => Promise<void>;
  addParticipant: () => Promise<void>;
  removeParticipant: (id: number) => Promise<void>;
  addGroup: () => Promise<void>;
  removeGroup: (id: number) => Promise<void>;
  removeFromGroup: (groupId: number, participantId: number) => Promise<void>;
  assignToGroups: () => Promise<void>;
  showGroupSelection: (participant: Participant, event: MouseEvent) => void;
  getParticipantName: (id: number) => string;
  getGroupsForParticipant: (participantId: number) => Group[];
  isInAnyGroup: (participantId: number) => boolean;
  closeModal: () => void;
  startDrag: (event: DragEvent, participant: Participant) => void;
  dropOnGroup: (event: DragEvent, group: Group) => Promise<void>;
  highlightParticipantError: (participantId: number) => void;
}

export function useStore(): UseStore {
  // Reactive state
  const state = ref<StoreState>({
    participants: [],
    groups: [],
    newParticipantName: "",
    showGroupModal: false,
    selectedParticipant: null,
    selectedGroups: [],
    modalPosition: { top: "0", left: "0" },
    draggedParticipant: null,
    loading: {
      participants: false,
      groups: false,
      addParticipant: false,
      addGroup: false,
      save: false,
    },
    error: null,
  });

  // Computed
  const participantGroups = computed<Record<number, number[]>>(() => {
    const map: Record<number, number[]> = {};
    state.value.participants.forEach((p) => {
      map[p.id] = state.value.groups
        .filter((g) => g.participants.includes(p.id))
        .map((g) => g.id);
    });
    return map;
  });

  // Firebase operations
  const loadData = async (): Promise<void> => {
    state.value.error = null;
    state.value.loading.participants = true;
    state.value.loading.groups = true;

    try {
      const participantsRef = dbRef(db, "participants");
      const groupsRef = dbRef(db, "groups");

      onValue(participantsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          state.value.participants = Array.isArray(data) ? data : [];
          state.value.loading.participants = false;
        } catch (err) {
          state.value.error = {
            code: "LOAD_PARTICIPANTS_ERROR",
            message: "Ошибка при загрузке списка участников",
          };
          state.value.loading.participants = false;
        }
      });

      onValue(groupsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          state.value.groups = Array.isArray(data)
            ? data.map((group) => ({
                ...group,
                participants: Array.isArray(group.participants)
                  ? group.participants
                  : [],
              }))
            : [];
          state.value.loading.groups = false;
        } catch (err) {
          state.value.error = {
            code: "LOAD_GROUPS_ERROR",
            message: "Ошибка при загрузке списка групп",
          };
          state.value.loading.groups = false;
        }
      });
    } catch (err) {
      state.value.error = {
        code: "LOAD_DATA_ERROR",
        message: "Ошибка при подключении к базе данных",
      };
      state.value.loading.participants = false;
      state.value.loading.groups = false;
    }
  };

  const saveParticipants = async (): Promise<void> => {
    state.value.loading.save = true;
    state.value.error = null;

    try {
      await set(dbRef(db, "participants"), state.value.participants);
      state.value.loading.save = false;
    } catch (err) {
      state.value.error = {
        code: "SAVE_PARTICIPANTS_ERROR",
        message: "Ошибка при сохранении участников",
      };
      state.value.loading.save = false;
      throw err;
    }
  };

  const saveGroups = async (): Promise<void> => {
    state.value.loading.save = true;
    state.value.error = null;

    try {
      const validGroups = state.value.groups.map((group) => ({
        ...group,
        participants: Array.isArray(group.participants)
          ? group.participants
          : [],
      }));
      await set(dbRef(db, "groups"), validGroups);
      state.value.loading.save = false;
    } catch (err) {
      state.value.error = {
        code: "SAVE_GROUPS_ERROR",
        message: "Ошибка при сохранении групп",
      };
      state.value.loading.save = false;
      throw err;
    }
  };

  // Participant operations
  const highlightParticipantError = (participantId: number): void => {
    const participantElement = document.querySelector(
      `.participant-item[data-id="${participantId}"]`
    );
    if (!participantElement) return;

    participantElement.classList.add("highlight-error-participant");
    setTimeout(() => {
      participantElement.classList.remove("highlight-error-participant");
    }, 2000);
  };

  const addParticipant = async (): Promise<void> => {
    const trimmedName = state.value.newParticipantName.trim();
    if (!trimmedName) return;

    state.value.loading.addParticipant = true;
    state.value.error = null;

    try {
      const existingParticipant = state.value.participants.find(
        (p) => p.name === trimmedName
      );

      if (existingParticipant) {
        highlightParticipantError(existingParticipant.id);
        state.value.newParticipantName = "";
        return;
      }

      const newId =
        Math.max(0, ...state.value.participants.map((p) => p.id)) + 1;
      state.value.participants.push({ id: newId, name: trimmedName });
      state.value.newParticipantName = "";
      await saveParticipants();
    } catch (err) {
      state.value.error = {
        code: "ADD_PARTICIPANT_ERROR",
        message: "Ошибка при добавлении участника",
      };
    } finally {
      state.value.loading.addParticipant = false;
    }
  };

  const removeParticipant = async (id: number): Promise<void> => {
    state.value.error = null;

    try {
      state.value.groups.forEach((group) => {
        group.participants = group.participants.filter((pid) => pid !== id);
      });
      state.value.participants = state.value.participants.filter(
        (p) => p.id !== id
      );
      await Promise.all([saveParticipants(), saveGroups()]);
    } catch (err) {
      state.value.error = {
        code: "REMOVE_PARTICIPANT_ERROR",
        message: "Ошибка при удалении участника",
      };
      throw err;
    }
  };

  // Group operations
  const addGroup = async (): Promise<void> => {
    const groupName = prompt("Введите название группы");
    if (!groupName) return;

    state.value.loading.addGroup = true;
    state.value.error = null;

    try {
      const newId = Math.max(0, ...state.value.groups.map((g) => g.id)) + 1;
      state.value.groups.push({
        id: newId,
        name: groupName,
        participants: [],
      });
      await saveGroups();
    } catch (err) {
      state.value.error = {
        code: "ADD_GROUP_ERROR",
        message: "Ошибка при создании группы",
      };
    } finally {
      state.value.loading.addGroup = false;
    }
  };

  const removeGroup = async (id: number): Promise<void> => {
    state.value.error = null;

    try {
      state.value.groups = state.value.groups.filter((g) => g.id !== id);
      await saveGroups();
    } catch (err) {
      state.value.error = {
        code: "REMOVE_GROUP_ERROR",
        message: "Ошибка при удалении группы",
      };
      throw err;
    }
  };

  const removeFromGroup = async (
    groupId: number,
    participantId: number
  ): Promise<void> => {
    state.value.error = null;

    try {
      const groupIndex = state.value.groups.findIndex((g) => g.id === groupId);
      if (groupIndex !== -1) {
        state.value.groups[groupIndex].participants = state.value.groups[
          groupIndex
        ].participants.filter((id) => id !== participantId);
        await saveGroups();
      }
    } catch (err) {
      state.value.error = {
        code: "REMOVE_FROM_GROUP_ERROR",
        message: "Ошибка при удалении участника из группы",
      };
      throw err;
    }
  };

  // UI operations
  const closeModal = (): void => {
    document.querySelectorAll(".highlight-group").forEach((el) => {
      el.classList.remove("highlight-group");
    });

    state.value.showGroupModal = false;
    state.value.selectedParticipant = null;
    state.value.selectedGroups = [];
  };

  const isInAnyGroup = (participantId: number): boolean => {
    return state.value.groups.some((g) =>
      g.participants.includes(participantId)
    );
  };

  const getGroupsForParticipant = (participantId: number): Group[] => {
    return state.value.groups.filter((g) =>
      g.participants.includes(participantId)
    );
  };

  const getParticipantName = (id: number): string => {
    const p = state.value.participants.find((p) => p.id === id);
    return p ? p.name : "";
  };

  const showGroupSelection = (
    participant: Participant,
    event: MouseEvent
  ): void => {
    state.value.selectedParticipant = participant;
    state.value.selectedGroups = [];

    state.value.groups.forEach((group) => {
      const groupElement = document.querySelector(
        `.group[data-id="${group.id}"]`
      );
      if (groupElement) {
        if (group.participants.includes(participant.id)) {
          groupElement.classList.add("highlight-group");
        } else {
          groupElement.classList.remove("highlight-group");
        }
      }
    });

    const participantRect = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    state.value.modalPosition = {
      top: `${participantRect.top}px`,
      left: `${participantRect.right + 10}px`,
    };

    state.value.showGroupModal = true;
  };

  const assignToGroups = async (): Promise<void> => {
    if (
      !state.value.selectedParticipant ||
      state.value.selectedGroups.length === 0
    )
      return;

    state.value.error = null;

    try {
      const updatedGroups = state.value.selectedGroups.map((groupId) => {
        const group = state.value.groups.find((g) => g.id === groupId);
        if (
          group &&
          !group.participants.includes(state.value.selectedParticipant!.id)
        ) {
          group.participants.push(state.value.selectedParticipant!.id);
          return true;
        }
        return false;
      });

      if (updatedGroups.some((updated) => updated)) {
        await saveGroups();
      }
    } catch (err) {
      state.value.error = {
        code: "ASSIGN_TO_GROUPS_ERROR",
        message: "Ошибка при добавлении участника в группы",
      };
      throw err;
    } finally {
      closeModal();
    }
  };

  // Drag and drop operations
  const startDrag = (event: DragEvent, participant: Participant): void => {
    state.value.draggedParticipant = participant;
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", participant.id.toString());
    }
  };

  const dropOnGroup = async (event: DragEvent, group: Group): Promise<void> => {
    if (!state.value.draggedParticipant) return;

    state.value.error = null;

    try {
      if (!group.participants.includes(state.value.draggedParticipant.id)) {
        group.participants.push(state.value.draggedParticipant.id);
        await saveGroups();
      }
    } catch (err) {
      state.value.error = {
        code: "DROP_ON_GROUP_ERROR",
        message: "Ошибка при перетаскивании участника в группу",
      };
      throw err;
    } finally {
      state.value.draggedParticipant = null;
    }
  };

  return {
    // State
    participants: computed(() => state.value.participants),
    groups: computed(() => state.value.groups),
    newParticipantName: computed({
      get: () => state.value.newParticipantName,
      set: (value) => (state.value.newParticipantName = value),
    }),
    showGroupModal: computed(() => state.value.showGroupModal),
    selectedParticipant: computed(() => state.value.selectedParticipant),
    selectedGroups: computed({
      get: () => state.value.selectedGroups,
      set: (value) => (state.value.selectedGroups = value),
    }),
    modalPosition: computed(() => state.value.modalPosition),
    draggedParticipant: computed(() => state.value.draggedParticipant),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),

    // Computed
    participantGroups,

    // Methods
    loadData,
    saveParticipants,
    saveGroups,
    addParticipant,
    removeParticipant,
    addGroup,
    removeGroup,
    removeFromGroup,
    assignToGroups,
    showGroupSelection,
    getParticipantName,
    getGroupsForParticipant,
    isInAnyGroup,
    closeModal,
    startDrag,
    dropOnGroup,
    highlightParticipantError,
  };
}
