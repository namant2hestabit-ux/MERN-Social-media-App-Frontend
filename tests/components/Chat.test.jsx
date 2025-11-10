import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useSelector } from "react-redux";
import api from "../../src/api/api";

// 🩹 Fix: mock scrollIntoView (JSDOM doesn’t implement it)
window.HTMLElement.prototype.scrollIntoView = vi.fn();

let mockOn, mockEmit, mockOff;

beforeAll(async () => {
  mockOn = vi.fn();
  mockEmit = vi.fn();
  mockOff = vi.fn();

  vi.doMock("socket.io-client", () => ({
    io: vi.fn(() => ({
      on: mockOn,
      off: mockOff,
      emit: mockEmit,
    })),
  }));
});

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const { default: Chat } = await import("../../src/components/Chat");

describe("Chat Component", () => {
  const mockUser = { _id: "123", firstName: "John" };
  const mockOtherUser = { _id: "456", firstName: "Alice" };
  const mockMessages = [
    { sender: "123", text: "Hi Alice!" },
    { sender: "456", text: "Hey John!" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockReturnValue({ user: mockUser });

    api.get.mockImplementation((url) => {
      if (url === "/users") return Promise.resolve({ data: { users: [mockUser, mockOtherUser] } });
      if (url === `/message/${mockOtherUser._id}`) return Promise.resolve({ data: mockMessages });
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({ status: 201 });
  });

  it("renders placeholder before selecting a user", () => {
    render(<Chat />);
    expect(screen.getByText(/select a user to chat/i)).toBeInTheDocument();
  });

  it("loads and displays users", async () => {
    render(<Chat />);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users");
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  it("fetches messages when a user is selected", async () => {
    render(<Chat />);
    await waitFor(() => screen.getByText("Alice"));
    fireEvent.click(screen.getByText("Alice"));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(`/message/${mockOtherUser._id}`);
    });
  });

  it("displays messages after selecting a user", async () => {
    render(<Chat />);
    await waitFor(() => screen.getByText("Alice"));
    fireEvent.click(screen.getByText("Alice"));
    await waitFor(() => {
      expect(screen.getByText("Hi Alice!")).toBeInTheDocument();
      expect(screen.getByText("Hey John!")).toBeInTheDocument();
    });
  });
});
