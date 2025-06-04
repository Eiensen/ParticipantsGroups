import type { Ref } from "vue";
import type { Participant, Group, ModalPosition, AppError } from "./index";

export interface StoreRefs {
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
}
