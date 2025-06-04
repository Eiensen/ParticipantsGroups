import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import GroupList from "../components/groups/GroupList.vue";
import GroupItem from "../components/groups/GroupItem.vue";
import type { Group } from "../types";

describe("GroupList.vue", () => {
  const mockGroups: Group[] = [
    { id: 1, name: "Group 1", participants: [1] },
    { id: 2, name: "Group 2", participants: [2] },
  ];

  it("renders all groups", () => {
    render(GroupList, {
      props: {
        groups: mockGroups,
      },
      global: {
        components: { GroupItem },
      },
    });

    const groupItems = screen.getAllByTestId("group-item");
    expect(groupItems).toHaveLength(2);
    expect(groupItems[0]).toHaveTextContent("Group 1");
    expect(groupItems[1]).toHaveTextContent("Group 2");
  });

  it("passes onRemove callback to GroupItem", async () => {
    const onRemoveGroup = vi.fn();
    render(GroupList, {
      props: {
        groups: mockGroups,
        onRemoveGroup,
      },
      global: {
        components: { GroupItem },
      },
    });

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    await fireEvent.click(deleteButtons[0]);
    expect(onRemoveGroup).toHaveBeenCalledWith(1);
  });

  it("handles drop events on groups", async () => {
    const onDropOnGroup = vi.fn();
    const { container } = render(GroupList, {
      props: {
        groups: mockGroups,
        onDropOnGroup,
      },
      global: {
        components: { GroupItem },
      },
    });

    const firstGroup = container.querySelector("[data-testid='group-item']");
    expect(firstGroup).toBeInTheDocument();

    if (firstGroup) {
      const dropEvent = new Event("drop");
      await fireEvent.drop(firstGroup, dropEvent);
      expect(onDropOnGroup).toHaveBeenCalledWith(dropEvent, mockGroups[0]);
    }
  });

  it("renders custom group content when renderGroupContent is provided", () => {
    const renderGroupContent = (group: Group) =>
      `<div data-testid="custom-content">${group.name} Content</div>`;
    render(GroupList, {
      props: {
        groups: mockGroups,
        renderGroupContent,
      },
      global: {
        components: { GroupItem },
      },
    });

    const customContents = screen.getAllByTestId("custom-content");
    expect(customContents).toHaveLength(2);
    expect(customContents[0]).toHaveTextContent("Group 1 Content");
    expect(customContents[1]).toHaveTextContent("Group 2 Content");
  });

  it("adds data-testid attribute to groups container", () => {
    const { container } = render(GroupList, {
      props: {
        groups: mockGroups,
      },
      global: {
        components: { GroupItem },
      },
    });

    const groupsContainer = container.querySelector(
      "[data-testid='groups-container']"
    );
    expect(groupsContainer).toBeInTheDocument();
  });
});
