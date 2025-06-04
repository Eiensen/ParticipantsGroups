/**
 * Interface representing a participant in the system
 */
export interface Participant {
  id: number;
  name: string;
}

/**
 * Interface representing a group in the system
 */
export interface Group {
  id: number;
  name: string;
  participants: number[];
}

/**
 * Interface representing modal position
 */
export interface ModalPosition {
  top: string;
  left: string;
}

/**
 * Interface for application error
 */
export interface AppError {
  code: string;
  message: string;
}

/**
 * Interface for store state
 */
export interface StoreState {
  participants: Participant[];
  groups: Group[];
  newParticipantName: string;
  showGroupModal: boolean;
  selectedParticipant: Participant | null;
  selectedGroups: number[];
  modalPosition: ModalPosition;
  draggedParticipant: Participant | null;
  loading: {
    participants: boolean;
    groups: boolean;
    addParticipant: boolean;
    addGroup: boolean;
    save: boolean;
  };
  error: AppError | null;
}
