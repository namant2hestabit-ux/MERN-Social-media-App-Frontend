import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import MyPosts from "../../src/components/MyPosts";
import api from "../../src/api/api";

// === Mock the API module ===
vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("MyPosts Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Utility render
  const renderMyPosts = async (mockPosts = []) => {
    api.get.mockResolvedValueOnce({ data: { posts: mockPosts } });
    render(<MyPosts />);
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/user-posts"));
  };

  // === TESTS ===

  it("renders 'no posts' message when no posts exist", async () => {
    await renderMyPosts([]);

    expect(
      screen.getByText(/you haven't posted anything yet/i)
    ).toBeInTheDocument();
  });

  it("fetches and displays posts on mount", async () => {
    const mockPosts = [
      { _id: "1", title: "First Post", imageURL: "img1.jpg" },
      { _id: "2", title: "Second Post", imageURL: "img2.jpg" },
    ];

    await renderMyPosts(mockPosts);

    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  it("enters edit mode when 'Edit' clicked", async () => {
    const mockPosts = [{ _id: "1", title: "Editable Post" }];
    await renderMyPosts(mockPosts);

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByDisplayValue("Editable Post")).toBeInTheDocument();
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it("cancels edit mode correctly", async () => {
    const mockPosts = [{ _id: "1", title: "Sample Post" }];
    await renderMyPosts(mockPosts);

    fireEvent.click(screen.getByText(/edit/i));
    fireEvent.click(screen.getByText(/cancel/i));

    expect(screen.getByText("Sample Post")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Sample Post")).not.toBeInTheDocument();
  });

  it("saves updated post successfully", async () => {
    const mockPosts = [{ _id: "1", title: "Old Title" }];
    await renderMyPosts(mockPosts);

    fireEvent.click(screen.getByText(/edit/i));

    const input = screen.getByDisplayValue("Old Title");
    fireEvent.change(input, { target: { value: "New Title" } });

    api.patch.mockResolvedValueOnce({
      data: { post: { _id: "1", title: "New Title" } },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/post/1", { title: "New Title" });
      expect(screen.getByText("New Title")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("New Title")).not.toBeInTheDocument();
    });
  });

  it("deletes a post when 'Delete' clicked", async () => {
    const mockPosts = [
      { _id: "1", title: "Post 1" },
      { _id: "2", title: "Post 2" },
    ];

    await renderMyPosts(mockPosts);

    api.delete.mockResolvedValueOnce({ status: 200 });

    fireEvent.click(screen.getAllByText(/delete/i)[0]); // delete first post

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/post/1");
      expect(screen.queryByText("Post 1")).not.toBeInTheDocument();
      expect(screen.getByText("Post 2")).toBeInTheDocument();
    });
  });

  it("handles API failure gracefully (fetch)", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<MyPosts />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("handles API failure gracefully (delete)", async () => {
    const mockPosts = [{ _id: "1", title: "Post 1" }];
    await renderMyPosts(mockPosts);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    api.delete.mockRejectedValueOnce(new Error("Delete failed"));

    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());

    consoleSpy.mockRestore();
  });
});
