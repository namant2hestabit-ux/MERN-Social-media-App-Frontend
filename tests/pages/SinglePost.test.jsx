import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useParams } from "react-router-dom";
import { vi } from "vitest";
import SinglePost from "../../src/pages/SinglePost";
import Loader from "../../src/components/Loader";

// --- Mock useParams ---
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// --- Mock api ---
vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// --- Mock Loader ---
vi.mock("../../src/components/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

// --- Mock Lazy Comments ---
vi.mock("../../src/components/Comments", () => ({
  default: ({ postId }) => (
    <div data-testid="comments">Comments for {postId}</div>
  ),
}));

import api from "../../src/api/api";
import { act } from "react-dom/test-utils";

describe("SinglePost Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ id: "123" });
  });

  it("renders Loader initially while fetching post", async () => {
    api.get.mockResolvedValueOnce({ status: 200, data: { post: null } });

    render(
      <MemoryRouter>
        <SinglePost />
      </MemoryRouter>
    );

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("fetches and renders post details correctly", async () => {
    const mockPost = {
      _id: "123",
      title: "My Post",
      imageURL: "https://example.com/img.jpg",
      author: { firstName: "John" },
      comments: [],
    };
    api.get.mockResolvedValueOnce({ status: 200, data: { post: mockPost } });

    render(
      <MemoryRouter>
        <SinglePost />
      </MemoryRouter>
    );

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByText("My Post")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("No comments yet")).toBeInTheDocument();
    });
  });

  it("shows comments button and toggles Comments section", async () => {
    const mockPost = {
      _id: "123",
      title: "Post with comments",
      imageURL: "",
      author: { firstName: "Alice" },
      comments: [{ id: 1, text: "First!" }],
    };
    api.get.mockResolvedValueOnce({ status: 200, data: { post: mockPost } });

    render(
      <MemoryRouter>
        <SinglePost />
      </MemoryRouter>
    );

    // Wait for post data to load
    await waitFor(() =>
      expect(screen.getByText("Post with comments")).toBeInTheDocument()
    );

    const toggleButton = screen.getByRole("button", { name: /show comments/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to show comments
    fireEvent.click(toggleButton);

    await waitFor(() =>
      expect(screen.getByTestId("comments")).toHaveTextContent(
        "Comments for 123"
      )
    );

    // Hide comments
    fireEvent.click(screen.getByRole("button", { name: /hide comments/i }));
    expect(screen.queryByTestId("comments")).not.toBeInTheDocument();
  });

  it("updates comment input and sends comment successfully", async () => {
    const mockPost = {
      _id: "123",
      title: "Post",
      imageURL: "",
      author: { firstName: "Eve" },
      comments: [],
    };
    api.get.mockResolvedValue({ status: 200, data: { post: mockPost } });
    api.post.mockResolvedValueOnce({ status: 201 });

    render(
      <MemoryRouter>
        <SinglePost />
      </MemoryRouter>
    );

    // Wait for the post to load
    await waitFor(() => screen.getByText("Post"));

    // Type comment
    const input = screen.getByPlaceholderText(/add comment/i);
    fireEvent.change(input, { target: { value: "Nice post!" } });
    expect(input.value).toBe("Nice post!");

    // Click send
    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/comment/123", {
        comment: "Nice post!",
      });
    });
  });

  it("does not send empty comment", async () => {
    const mockPost = {
      _id: "123",
      title: "Empty comment test",
      imageURL: "",
      author: { firstName: "Leo" },
      comments: [],
    };
    api.get.mockResolvedValue({ status: 200, data: { post: mockPost } });

    render(
      <MemoryRouter>
        <SinglePost />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Empty comment test"));

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    expect(api.post).not.toHaveBeenCalled();
  });
});
