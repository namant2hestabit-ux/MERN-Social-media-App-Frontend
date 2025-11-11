import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Feed from "../../src/components/Feed";
import api from "../../src/api/api";
import { fireEvent } from "@testing-library/react";

// === Mock API ===
vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

// === Mock Child Components ===
vi.mock("../../src/components/Card", () => ({
  default: ({ postId, description }) => (
    <div data-testid="card" data-id={postId}>
      {description}
    </div>
  ),
}));

vi.mock("../../src/components/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

// === Mock IntersectionObserver ===
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = (element) => {
    // Immediately trigger intersection
    this.callback([{ isIntersecting: true, target: element }]);
  };
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

describe("Feed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧪 1. Shows loader on initial render
  it("renders loader on initial load", async () => {
    api.get.mockResolvedValueOnce({
      status: 201,
      data: { posts: [], hasMore: false },
    });

    render(<Feed />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  // 🧪 2. Fetches and renders posts
  it("fetches posts and displays cards", async () => {
    const mockPosts = [
      { _id: "1", title: "Post One", createdAt: Date.now(), author: { firstName: "A" } },
      { _id: "2", title: "Post Two", createdAt: Date.now(), author: { firstName: "B" } },
    ];

    api.get.mockResolvedValueOnce({
      status: 201,
      data: { posts: mockPosts, hasMore: true },
    });

    render(<Feed />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/posts?page=1&limit=12");
      expect(screen.getAllByTestId("card")).toHaveLength(2);
    });
  });

  // 🧪 3. Displays "No posts available" when API returns empty
  it("shows 'No posts available' when API returns empty list", async () => {
    api.get.mockResolvedValueOnce({
      status: 201,
      data: { posts: [], hasMore: false },
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/no posts available/i)).toBeInTheDocument();
    });
  });

  // 🧪 4. Loads more posts when observer triggers
  it("loads next page when loader is intersected", async () => {
    const firstBatch = [
      { _id: "1", title: "Post A", createdAt: Date.now(), author: { firstName: "Alpha" } },
    ];
    const secondBatch = [
      { _id: "2", title: "Post B", createdAt: Date.now(), author: { firstName: "Beta" } },
    ];

    api.get
      .mockResolvedValueOnce({ status: 201, data: { posts: firstBatch, hasMore: true } }) // first page
      .mockResolvedValueOnce({ status: 201, data: { posts: secondBatch, hasMore: false } }); // second page

    render(<Feed />);

    // Wait for first page
    await waitFor(() => expect(screen.getByText(/post a/i)).toBeInTheDocument());

    // Observer automatically triggers page++ and fetches more
    await waitFor(() => expect(screen.getByText(/post b/i)).toBeInTheDocument());
  });

  // 🧪 5. Handles API errors gracefully
  it("handles API errors without crashing", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("Network Error"));

    render(<Feed />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching posts:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  // 🧪 6. Stops fetching when hasMore is false
  it("stops loading when hasMore is false", async () => {
    api.get.mockResolvedValueOnce({
      status: 201,
      data: { posts: [{ _id: "1", title: "Final Post", createdAt: Date.now() }], hasMore: false },
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText("Final Post")).toBeInTheDocument();
    });

    // Try triggering observer again — should NOT fetch
    const loader = screen.queryByTestId("loader");
    expect(loader).toBeNull()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
