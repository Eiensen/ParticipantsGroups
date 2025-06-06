/**
 * Interface representing a participant in the system
 */
export interface Participant {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  groupId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface representing a group in the system
 */
export interface Group {
  id?: string;
  name: string;
  description?: string;
  maxParticipants?: number;
  participants: string[];
  createdAt?: Date;
  updatedAt?: Date;
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
