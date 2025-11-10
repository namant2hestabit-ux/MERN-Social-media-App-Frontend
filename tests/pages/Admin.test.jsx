import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import api from "../../src/api/api";

vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const { default: Admin } = await import("../../src/pages/Admin");

describe("Admin Component", () => {
  const mockDispatch = vi.fn();

  const mockUsers = [
    { _id: "1", firstName: "John", lastName: "Doe", email: "john@mail.com", role: "user" },
    { _id: "2", firstName: "Jane", lastName: "Smith", email: "jane@mail.com", role: "admin" },
  ];

  const mockPosts = [
    { _id: "10", title: "Post 1", author: { firstName: "John" } },
    { _id: "11", title: "Post 2", author: { firstName: "Jane" } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);

    api.get.mockImplementation((url) => {
      if (url === "/users") return Promise.resolve({ data: { users: mockUsers } });
      if (url === "/posts") return Promise.resolve({ data: { posts: mockPosts } });
      return Promise.resolve({ data: {} });
    });
  });

  it("renders dashboard and loads users/posts", async () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(screen.getByText(/admin panel/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users");
      expect(api.get).toHaveBeenCalledWith("/posts");
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Post 1")).toBeInTheDocument();
    });
  });

  it("handles logout successfully", async () => {
    api.post.mockResolvedValueOnce({ status: 200 });
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/logout");
      expect(mockDispatch).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Logged out");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("handles logout failure", async () => {
    api.post.mockRejectedValueOnce(new Error("Logout failed"));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Logout failed");
    });
  });

  it("opens and saves edited user successfully", async () => {
    api.patch.mockResolvedValueOnce({ status: 200 });
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));
    fireEvent.click(screen.getAllByText("Edit")[0]);

    // Modal appears
    expect(screen.getByText("Edit User")).toBeInTheDocument();

    // Change first name
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "Johnny" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        "/admin/user/1",
        expect.objectContaining({ firstName: "Johnny" })
      );
      expect(toast.success).toHaveBeenCalledWith("User updated successfully");
    });
  });

  it("handles user delete success", async () => {
    api.delete.mockResolvedValueOnce({ status: 200 });
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));
    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/admin/user/1");
      expect(toast.success).toHaveBeenCalledWith("User deleted");
    });
  });

  it("handles user delete failure", async () => {
    api.delete.mockRejectedValueOnce(new Error("fail"));
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));
    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Delete failed");
    });
  });

  it("handles post delete and navigation", async () => {
    api.delete.mockResolvedValueOnce({ status: 200 });
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Post 1"));
    fireEvent.click(screen.getAllByText("Delete")[2]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/admin/post/10");
      expect(toast.success).toHaveBeenCalledWith("Post deleted");
    });

    // Navigate when clicking "Expand"
    fireEvent.click(screen.getAllByText("Expand")[1]);
    expect(mockNavigate).toHaveBeenCalledWith("/post/11");
  });
});
