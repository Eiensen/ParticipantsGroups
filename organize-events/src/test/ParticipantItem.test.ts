import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ParticipantItem from "../components/participants/ParticipantItem.vue";
import type { Participant } from "../types";

describe("ParticipantItem.vue", () => {
  const mockParticipant: Participant = {
    id: 1,
    name: "John Doe",
  };

  it("renders participant name", () => {
    const wrapper = mount(ParticipantItem, {
      props: {
        participant: mockParticipant,
        isInGroup: false,
      },
    });

    expect(wrapper.text()).toContain("John Doe");
  });

  it("applies in-group class when isInGroup is true", () => {
    const wrapper = mount(ParticipantItem, {
      props: {
        participant: mockParticipant,
        isInGroup: true,
      },
    });

    expect(wrapper.classes()).toContain("in-group");
  });

  it("emits remove event when delete button is clicked", async () => {
    const onRemove = vi.fn();
    const wrapper = mount(ParticipantItem, {
      props: {
        participant: mockParticipant,
        isInGroup: false,
        onRemove,
      },
    });

    await wrapper.find(".delete-btn").trigger("click");
    expect(onRemove).toHaveBeenCalledWith(mockParticipant.id);
  });

  it("emits select event when participant is clicked", async () => {
    const onSelect = vi.fn();
    const wrapper = mount(ParticipantItem, {
      props: {
        participant: mockParticipant,
        isInGroup: false,
        onSelect,
      },
    });

    await wrapper.trigger("click");
    expect(onSelect).toHaveBeenCalledWith(
      mockParticipant,
      expect.any(MouseEvent)
    );
  });

  it("emits dragStart event when dragging starts", async () => {
    const onDragStart = vi.fn();
    const wrapper = mount(ParticipantItem, {
      props: {
        participant: mockParticipant,
        isInGroup: false,
        onDragStart,
      },
    });

    await wrapper.trigger("dragstart");
    expect(onDragStart).toHaveBeenCalledWith(
      expect.any(DragEvent),
      mockParticipant
    );
  });

  it("does not show delete button when onRemove is not provided", () => {
    const wrapper = mount(ParticipantItem, {
      props: {
        participant: mockParticipant,
        isInGroup: false,
      },
    });

    expect(wrapper.find(".delete-btn").exists()).toBe(false);
  });
});
