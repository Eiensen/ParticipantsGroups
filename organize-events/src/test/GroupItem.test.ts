import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import GroupItem from "../components/groups/GroupItem.vue";
import type { Group } from "../types";

describe("GroupItem.vue", () => {
  const mockGroup: Group = {
    id: 1,
    name: "Test Group",
    participants: [1, 2],
  };

  it("renders the group name", () => {
    render(GroupItem, {
      props: {
        group: mockGroup,
      },
    });

    expect(screen.getByText("Test Group")).toBeInTheDocument();
  });

  it("sets the correct data-id attribute", () => {
    const { container } = render(GroupItem, {
      props: {
        group: mockGroup,
      },
    });

    const groupElement = container.querySelector("[data-testid='group-item']");
    expect(groupElement).toHaveAttribute("data-id", "1");
  });

  it("shows remove button when onRemove prop is provided", () => {
    const onRemove = vi.fn();
    render(GroupItem, {
      props: {
        group: mockGroup,
        onRemove,
      },
    });

    const deleteButton = screen.getByRole("button", { name: "X" });
    expect(deleteButton).toBeInTheDocument();
  });

  it("hides remove button when onRemove prop is not provided", () => {
    render(GroupItem, {
      props: {
        group: mockGroup,
      },
    });

    const deleteButton = screen.queryByRole("button", { name: "X" });
    expect(deleteButton).not.toBeInTheDocument();
  });

  it("calls onRemove with group id when delete button is clicked", async () => {
    const onRemove = vi.fn();
    render(GroupItem, {
      props: {
        group: mockGroup,
        onRemove,
      },
    });

    const deleteButton = screen.getByRole("button", { name: "X" });
    await fireEvent.click(deleteButton);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("calls onDrop when drop event occurs", async () => {
    const onDrop = vi.fn();
    const { container } = render(GroupItem, {
      props: {
        group: mockGroup,
        onDrop,
      },
    });

    const groupElement = container.querySelector("[data-testid='group-item']");
    expect(groupElement).toBeInTheDocument();

    if (groupElement) {
      const dropEvent = new Event("drop");
      await fireEvent.drop(groupElement, dropEvent);
      expect(onDrop).toHaveBeenCalledWith(dropEvent);
    }
  });

  it("prevents default on dragover", async () => {
    const { container } = render(GroupItem, {
      props: {
        group: mockGroup,
      },
    });

    const groupElement = container.querySelector("[data-testid='group-item']");
    expect(groupElement).toBeInTheDocument();

    if (groupElement) {
      const preventDefault = vi.fn();
      const dragoverEvent = new Event("dragover");
      Object.defineProperty(dragoverEvent, "preventDefault", {
        value: preventDefault,
      });

      await fireEvent.dragOver(groupElement, dragoverEvent);
      expect(preventDefault).toHaveBeenCalled();
    }
  });

  it("renders slot content", () => {
    render(GroupItem, {
      props: {
        group: mockGroup,
      },
      slots: {
        default: '<div data-testid="test-slot">Slot Content</div>',
      },
    });

    const slotContent = screen.getByTestId("test-slot");
    expect(slotContent).toBeInTheDocument();
    expect(slotContent).toHaveTextContent("Slot Content");
  });
});
