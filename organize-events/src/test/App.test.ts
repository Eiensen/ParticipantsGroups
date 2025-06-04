import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import App from "../App.vue";
import { useStore } from "../store/useStore";

// Mock the store
vi.mock("../store/useStore", () => ({
  useStore: () => ({
    participants: { value: [] },
    groups: { value: [] },
    newParticipantName: { value: "" },
    showGroupModal: { value: false },
    selectedParticipant: { value: null },
    selectedGroups: { value: [] },
    modalPosition: { value: { top: "0", left: "0" } },
    loadData: vi.fn(),
    saveParticipants: vi.fn(),
    addParticipant: vi.fn(),
    removeParticipant: vi.fn(),
    addGroup: vi.fn(),
    removeGroup: vi.fn(),
    removeFromGroup: vi.fn(),
    isInAnyGroup: vi.fn(),
    getParticipantName: vi.fn(),
    showGroupSelection: vi.fn(),
    closeModal: vi.fn(),
    assignToGroups: vi.fn(),
    startDrag: vi.fn(),
    dropOnGroup: vi.fn(),
  }),
}));

describe("App.vue", () => {
  it("renders without errors", () => {
    const { container } = render(App);
    expect(container.innerHTML).toBeTruthy();
  });

  it("calls loadData on mount", () => {
    const store = useStore();
    render(App);
    expect(store.loadData).toHaveBeenCalled();
  });

  it("renders participants list correctly", async () => {
    const store = useStore();
    store.participants.value = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ];

    render(App);
    const participants = screen.getAllByTestId("participant-item");
    expect(participants).toHaveLength(2);
    expect(participants[0]).toHaveTextContent("John Doe");
  });

  it("renders groups correctly", async () => {
    const store = useStore();
    store.groups.value = [
      { id: 1, name: "Group 1", participants: [] },
      { id: 2, name: "Group 2", participants: [] },
    ];

    render(App);
    const groups = screen.getAllByTestId("group-item");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveTextContent("Group 1");
  });

  it("adds participant on button click", async () => {
    const store = useStore();
    const { getByPlaceholderText, getByRole } = render(App);

    const input = getByPlaceholderText("Введите ФИО");
    const button = getByRole("button", { name: "+" });

    await fireEvent.update(input, "New Person");
    await fireEvent.click(button);

    expect(store.addParticipant).toHaveBeenCalled();
  });

  it("removes participant on delete button click", async () => {
    const store = useStore();
    store.participants.value = [{ id: 1, name: "John Doe" }];

    render(App);
    const deleteButton = screen.getByRole("button", { name: "×" });
    await fireEvent.click(deleteButton);

    expect(store.removeParticipant).toHaveBeenCalledWith(1);
  });

  it("opens modal on participant click", async () => {
    const store = useStore();
    store.participants.value = [{ id: 1, name: "John Doe" }];

    render(App);
    const participant = screen.getByTestId("participant-item");
    await fireEvent.click(participant);

    expect(store.showGroupSelection).toHaveBeenCalled();
  });

  it("shows loading overlay when loading participants or groups", () => {
    const store = useStore();
    store.loading.value = {
      ...store.loading.value,
      participants: true,
      groups: false,
    };

    render(App);
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("shows error message when there is an error", () => {
    const store = useStore();
    store.error.value = {
      code: "TEST_ERROR",
      message: "Test error message",
    };

    render(App);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });
});
