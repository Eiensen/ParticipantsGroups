import { ref, computed } from "vue";
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, set, onValue } from "firebase/database";

// TODO: uncomment then need analytics
//import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK_TOb75b9U0VDx93GLq1VkpCnzZm-DE4",
  authDomain: "participants-seva.firebaseapp.com",
  projectId: "participants-seva",
  storageBucket: "participants-seva.firebasestorage.app",
  messagingSenderId: "587560809720",
  appId: "1:587560809720:web:87dd4167777a3d799b770d",
  measurementId: "G-MLLV2HH2NH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// TODO: uncomment then need analytics
//const analytics = getAnalytics(app);

export function useStore() {
  // Reactive state
  const participants = ref([]);
  const groups = ref([]);
  const newParticipantName = ref("");
  const showGroupModal = ref(false);
  const selectedParticipant = ref(null);
  const selectedGroups = ref([]);
  const modalPosition = ref({ top: "0", left: "0" });
  const draggedParticipant = ref(null);

  // Computed
  const participantGroups = computed(() => {
    const map = {};
    participants.value.forEach((p) => {
      map[p.id] = groups.value
        .filter((g) => g.participants.includes(p.id))
        .map((g) => g.id);
    });
    return map;
  });

  // Firebase operations
  const loadData = async () => {
    const participantsRef = dbRef(db, "participants");
    const groupsRef = dbRef(db, "groups");

    onValue(participantsRef, (snapshot) => {
      participants.value = snapshot.val() || [];
    });

    onValue(groupsRef, (snapshot) => {
      groups.value = snapshot.val() || [];
    });
  };

  const saveParticipants = async () => {
    await set(dbRef(db, "participants"), participants.value);
  };

  const saveGroups = async () => {
    await set(dbRef(db, "groups"), groups.value);
  };

  // Methods
  const addParticipant = async () => {
    if (newParticipantName.value.trim()) {
      const newId = Math.max(0, ...participants.value.map((p) => p.id)) + 1;
      participants.value.push({
        id: newId,
        name: newParticipantName.value.trim(),
      });
      newParticipantName.value = "";
      await saveParticipants();
    }
  };

  const removeParticipant = async (id) => {
    groups.value.forEach((group) => {
      group.participants = group.participants.filter((pid) => pid !== id);
    });
    participants.value = participants.value.filter((p) => p.id !== id);
    await Promise.all([saveParticipants(), saveGroups()]);
  };

  const addGroup = async () => {
    const groupName = prompt("Введите название группы");
    if (groupName) {
      const newId = Math.max(0, ...groups.value.map((g) => g.id)) + 1;
      groups.value.push({
        id: newId,
        name: groupName,
        participants: [],
      });
      await saveGroups();
    }
  };

  const removeGroup = async (id) => {
    groups.value = groups.value.filter((g) => g.id !== id);
    await saveGroups();
  };

  const removeFromGroup = async (groupId, participantId) => {
    const group = groups.value.find((g) => g.id === groupId);
    if (group) {
      group.participants = group.participants.filter(
        (id) => id !== participantId
      );
      await saveGroups();
    }
  };

  const closeModal = () => {
    // Убираем подсветку групп
    document.querySelectorAll(".highlight-group").forEach((el) => {
      el.classList.remove("highlight-group");
    });

    showGroupModal.value = false;
    selectedParticipant.value = null;
    selectedGroups.value = [];
  };
  const isInAnyGroup = (participantId) => {
    console.log(groups.value);
    if (groups.value)
      return groups.value.some(
        (g) => g.participants?.includes(participantId) ?? false
      );
  };

  const getGroupsForParticipant = (participantId) => {
    return groups.value.filter(
      (g) => g.participants?.includes(participantId) ?? []
    );
  };

  const getParticipantName = (id) => {
    const p = participants.value.find((p) => p.id === id);
    return p ? p.name : "";
  };

  const showGroupSelection = (participant, event) => {
    selectedParticipant.value = participant;
    selectedGroups.value = [];

    // Подсветка групп, где есть участник
    groups.value.forEach((group) => {
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

    // Позиционирование модального окна
    const participantRect = event.target.getBoundingClientRect();
    modalPosition.value = {
      top: `${participantRect.top}px`,
      left: `${participantRect.right + 10}px`,
    };

    showGroupModal.value = true;
  };
  const assignToGroups = () => {
    if (!selectedParticipant.value || selectedGroups.value.length === 0) return;

    // Добавляем в выбранные группы
    selectedGroups.value.forEach((groupId) => {
      const group = groups.value.find((g) => g.id === groupId);
      if (group && !group.participants.includes(selectedParticipant.value.id)) {
        group.participants.push(selectedParticipant.value.id);
      }
    });

    closeModal();
  };

  const startDrag = (event, participant) => {
    draggedParticipant.value = participant;
    event.dataTransfer.setData("text/plain", participant.id);
  };

  const dropOnGroup = (event, group) => {
    if (draggedParticipant.value) {
      if (group.participants) {
        if (!group.participants.includes(draggedParticipant.value.id)) {
          group.participants.push(draggedParticipant.value.id);
        }
      } else {
        group.participants = [];
        group.participants.push(draggedParticipant.value.id);
      }
      draggedParticipant.value = null;
    }
  };

  // Other methods (showGroupSelection, closeModal, etc.) remain the same as before

  return {
    // State
    participants,
    groups,
    newParticipantName,
    showGroupModal,
    selectedParticipant,
    selectedGroups,
    modalPosition,

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
    // ... other methods
  };
}
