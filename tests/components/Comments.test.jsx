import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Comments from "../../src/components/Comments";
import api from "../../src/api/api";
import { useSelector } from "react-redux";

// ===== Mock API =====
vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

// ===== Mock Redux =====
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

describe("Comments Component", () => {
  const mockUser = { firstName: "John", role: "user" };
  const mockAdmin = { firstName: "Admin", role: "admin" };
  const mockComments = [
    {
      _id: "1",
      comment: "Great post!",
      user: { firstName: "Alice" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      comment: "Thanks for sharing!",
      user: { firstName: "Bob" },
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockReturnValue({ user: mockUser });
  });

  // 1. Renders loading state
  it("renders loading text initially", () => {
    api.get.mockResolvedValueOnce({ data: { comment: [] } });
    render(<Comments postId="123" />);
    expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
  });

  // 2. Renders fetched comments
  it("renders comments after successful fetch", async () => {
    api.get.mockResolvedValueOnce({ data: { comment: mockComments } });

    render(<Comments postId="123" />);

    await waitFor(() => {
      expect(screen.getByText(/great post/i)).toBeInTheDocument();
      expect(screen.getByText(/thanks for sharing/i)).toBeInTheDocument();
    });
  });

  // 3. Handles API fetch error gracefully
  it("handles fetch error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<Comments postId="123" />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching comments:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  // 4. Allows editing a comment
  it("enters edit mode and saves updated comment", async () => {
    api.get.mockResolvedValueOnce({ data: { comment: mockComments } });
    api.patch.mockResolvedValueOnce({ status: 201 });

    render(<Comments postId="123" />);

    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
    });

    // Click "Edit"
    fireEvent.click(screen.getAllByText("Edit")[0]);

    const input = screen.getByDisplayValue("Great post!");
    fireEvent.change(input, { target: { value: "Updated comment" } });

    // Click "Save"
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/comment/1", {
        comment: "Updated comment",
      });
    });
  });

  // 5. Cancels edit mode
  it("cancels editing comment when clicking cancel", async () => {
    api.get.mockResolvedValueOnce({ data: { comment: mockComments } });
    render(<Comments postId="123" />);

    await waitFor(() => screen.getByText("Great post!"));
    fireEvent.click(screen.getAllByText("Edit")[0]);

    expect(screen.getByDisplayValue("Great post!")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
    });
  });

  // 6. Deletes comment (user)
  it("deletes comment using user endpoint", async () => {
    api.get.mockResolvedValueOnce({ data: { comment: mockComments } });
    api.delete.mockResolvedValueOnce({ status: 201 });

    render(<Comments postId="123" />);

    await waitFor(() => screen.getByText("Great post!"));
    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/comment/1");
    });
  });

  // 7. Deletes comment (admin)
  it("uses admin delete endpoint if user is admin", async () => {
    useSelector.mockReturnValue({ user: mockAdmin });
    api.get.mockResolvedValueOnce({ data: { comment: mockComments } });
    api.delete.mockResolvedValueOnce({ status: 201 });

    render(<Comments postId="123" />);

    await waitFor(() => screen.getByText("Great post!"));
    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("admin/comment/1");
    });
  });
});
