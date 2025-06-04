import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStore } from "../store/useStore";
import { ref, onValue, set } from "firebase/database";
import type { DataSnapshot, DatabaseReference } from "firebase/database";

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  set: vi.fn(),
  onValue: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
}));

// Mock data
const mockParticipants = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
];

const mockGroups = [
  { id: 1, name: "Group 1", participants: [1] },
  { id: 2, name: "Group 2", participants: [2] },
];

const createMockRef = (path: string): DatabaseReference =>
  ({
    key: path,
    parent: null,
    root: null,
    toJSON: () => ({}),
    toString: () => path,
    isEqual: () => true,
    ref: () => createMockRef(path),
  } as unknown as DatabaseReference);

const createMockSnapshot = (data: any): DataSnapshot =>
  ({
    val: () => data,
    exists: () => true,
    child: () => null,
    forEach: () => false,
    hasChild: () => false,
    hasChildren: () => false,
    key: null,
    size: 0,
    ref: createMockRef(""),
    toJSON: () => data,
    priority: null,
  } as unknown as DataSnapshot);

// Setup Firebase mocks
beforeEach(() => {
  vi.mocked(ref).mockImplementation((_, path) => createMockRef(path as string));
  vi.mocked(onValue).mockImplementation((ref, callback) => {
    const mockRef = ref as DatabaseReference;
    if (mockRef.key === "participants") {
      callback(createMockSnapshot(mockParticipants));
    } else if (mockRef.key === "groups") {
      callback(createMockSnapshot(mockGroups));
    }
    return () => {}; // Return unsubscribe function
  });
});

describe("useStore", () => {
  let store: ReturnType<typeof useStore>;

  beforeEach(() => {
    store = useStore();
  });
  describe("loadData", () => {
    it("should load participants and groups from firebase", async () => {
      await store.loadData();
      expect(store.participants.value).toEqual(mockParticipants);
      expect(store.groups.value).toEqual(mockGroups);
    });

    it("should set loading states correctly", async () => {
      const loadingPromise = store.loadData();
      expect(store.loading.value.participants).toBe(true);
      expect(store.loading.value.groups).toBe(true);

      await loadingPromise;
      expect(store.loading.value.participants).toBe(false);
      expect(store.loading.value.groups).toBe(false);
    });

    it("should handle errors correctly", async () => {
      vi.mocked(onValue).mockImplementation(() => {
        throw new Error("Firebase error");
      });

      await store.loadData();
      expect(store.error.value?.code).toBe("LOAD_DATA_ERROR");
      expect(store.loading.value.participants).toBe(false);
      expect(store.loading.value.groups).toBe(false);
    });
  });

  describe("addParticipant", () => {
    it("should add a new participant", async () => {
      store.newParticipantName.value = "New Person";
      await store.addParticipant();

      expect(store.participants.value).toContainEqual(
        expect.objectContaining({
          name: "New Person",
        })
      );
      expect(store.newParticipantName.value).toBe("");
      expect(store.loading.value.addParticipant).toBe(false);
    });

    it("should not add duplicate participant names", async () => {
      store.participants.value = mockParticipants;
      store.newParticipantName.value = "John Doe";

      await store.addParticipant();

      expect(store.participants.value).toHaveLength(2);
      expect(store.newParticipantName.value).toBe("");
      expect(store.error.value).toBeNull();
    });

    it("should handle save errors", async () => {
      vi.mocked(set).mockRejectedValueOnce(new Error("Save error"));
      store.newParticipantName.value = "New Person";

      await store.addParticipant();

      expect(store.error.value?.code).toBe("ADD_PARTICIPANT_ERROR");
      expect(store.loading.value.addParticipant).toBe(false);
    });
  });

  describe("participantGroups", () => {
    it("should compute participant group mappings correctly", () => {
      store.participants.value = mockParticipants;
      store.groups.value = mockGroups;

      const mappings = store.participantGroups.value;
      expect(mappings[1]).toEqual([1]);
      expect(mappings[2]).toEqual([2]);
    });
  });

  describe("removeParticipant", () => {
    it("should remove participant and their group associations", async () => {
      store.participants.value = mockParticipants;
      store.groups.value = mockGroups;

      await store.removeParticipant(1);

      expect(store.participants.value).not.toContainEqual(
        expect.objectContaining({ id: 1 })
      );
      expect(store.groups.value[0].participants).not.toContain(1);
      expect(store.error.value).toBeNull();
    });

    it("should handle remove errors", async () => {
      vi.mocked(set).mockRejectedValueOnce(new Error("Remove error"));
      store.participants.value = mockParticipants;
      store.groups.value = mockGroups;

      await expect(store.removeParticipant(1)).rejects.toThrow();
      expect(store.error.value?.code).toBe("REMOVE_PARTICIPANT_ERROR");
    });
  });

  describe("group operations", () => {
    it("should add a new group", async () => {
      vi.spyOn(window, "prompt").mockReturnValue("New Group");
      await store.addGroup();

      expect(store.groups.value).toContainEqual(
        expect.objectContaining({
          name: "New Group",
          participants: [],
        })
      );
      expect(store.loading.value.addGroup).toBe(false);
      expect(store.error.value).toBeNull();
    });

    it("should handle group save errors", async () => {
      vi.spyOn(window, "prompt").mockReturnValue("New Group");
      vi.mocked(set).mockRejectedValueOnce(new Error("Save error"));

      await store.addGroup();

      expect(store.error.value?.code).toBe("ADD_GROUP_ERROR");
      expect(store.loading.value.addGroup).toBe(false);
    });

    it("should not add group with empty name", async () => {
      vi.spyOn(window, "prompt").mockReturnValue("");
      await store.addGroup();

      expect(store.groups.value).toHaveLength(2);
      expect(store.loading.value.addGroup).toBe(false);
    });
  });

  describe("drag and drop operations", () => {
    const mockDragEvent = new Event("drop") as DragEvent;

    it("should handle participant drag start", () => {
      const participant = mockParticipants[0];
      store.startDrag(mockDragEvent, participant);

      expect(store.draggedParticipant.value).toEqual(participant);
    });

    it("should handle drop on group", async () => {
      const group = mockGroups[0];
      const participant = mockParticipants[1];
      store.draggedParticipant.value = participant;

      await store.dropOnGroup(mockDragEvent, group);

      expect(group.participants).toContain(participant.id);
      expect(store.draggedParticipant.value).toBeNull();
      expect(store.error.value).toBeNull();
    });

    it("should handle drop errors", async () => {
      vi.mocked(set).mockRejectedValueOnce(new Error("Drop error"));
      const group = mockGroups[0];
      const participant = mockParticipants[1];
      store.draggedParticipant.value = participant;

      await expect(store.dropOnGroup(mockDragEvent, group)).rejects.toThrow();
      expect(store.error.value?.code).toBe("DROP_ON_GROUP_ERROR");
      expect(store.draggedParticipant.value).toBeNull();
    });
  });
});
