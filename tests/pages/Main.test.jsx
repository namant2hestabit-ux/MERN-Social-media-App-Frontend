import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Main from "../../src/pages/Main";

// ✅ Fix: partial mock to preserve Provider
vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// ✅ Router mock
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ✅ Mock components used in lazy imports
vi.mock("../../src/components/Feed", () => ({
  default: () => <div data-testid="feed-component">Feed</div>,
}));
vi.mock("../../src/components/Profile", () => ({
  default: () => <div data-testid="profile-component">Profile</div>,
}));
vi.mock("../../src/components/Chat", () => ({
  default: () => <div data-testid="chat-component">Chat</div>,
}));
vi.mock("../../src/components/CreatePost", () => ({
  default: () => <div data-testid="createpost-component">CreatePost</div>,
}));
vi.mock("../../src/components/MyPosts", () => ({
  default: () => <div data-testid="myposts-component">MyPosts</div>,
}));
vi.mock("../../src/components/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));
vi.mock("../../src/components/Navbar", () => ({
  default: ({ active, setActive }) => (
    <nav data-testid="navbar">
      <button data-testid="home-btn" onClick={() => setActive("Home")}>
        Home
      </button>
      <button data-testid="profile-btn" onClick={() => setActive("Profile")}>
        Profile
      </button>
      <button data-testid="chat-btn" onClick={() => setActive("Chat")}>
        Chat
      </button>
      <button data-testid="create-btn" onClick={() => setActive("Create")}>
        Create
      </button>
      <button data-testid="logout-btn" onClick={() => setActive("Logout")}>
        Logout
      </button>
    </nav>
  ),
}));

describe("Main Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("renders Loader fallback while lazy components load", async () => {
    useSelector.mockReturnValue({ user: { _id: "1", firstName: "John" } });

    render(
      <Provider
        store={{
          getState: () => ({ auth: {} }),
          subscribe: vi.fn(),
          dispatch: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Main />
        </MemoryRouter>
      </Provider>
    );

    // Loader should be visible initially
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("feed-component")).toBeInTheDocument()
    );
  });

  it("renders Feed by default (Home tab)", async () => {
    useSelector.mockReturnValue({ user: { _id: "1", firstName: "John" } });

    render(
      <Provider
        store={{
          getState: () => ({ auth: {} }),
          subscribe: vi.fn(),
          dispatch: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Main />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("feed-component")).toBeInTheDocument();
    });
  });

  it("switches tabs correctly and renders corresponding components", async () => {
    useSelector.mockReturnValue({ user: { _id: "1", firstName: "John" } });

    render(
      <Provider
        store={{
          getState: () => ({ auth: {} }),
          subscribe: vi.fn(),
          dispatch: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Main />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("profile-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("profile-component")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("chat-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("chat-component")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("create-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("createpost-component")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("logout-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("myposts-component")).toBeInTheDocument()
    );
  });

  it("persists and reads active tab from localStorage", async () => {
    useSelector.mockReturnValue({ user: { _id: "1", firstName: "John" } });
    localStorage.setItem("activeTab", "Profile");

    render(
      <Provider
        store={{
          getState: () => ({ auth: {} }),
          subscribe: vi.fn(),
          dispatch: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Main />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile-component")).toBeInTheDocument();
    });
  });

  it("renders nothing when user is null", () => {
    useSelector.mockReturnValue({ user: null });

    const { container } = render(
      <Provider
        store={{
          getState: () => ({ auth: {} }),
          subscribe: vi.fn(),
          dispatch: vi.fn(),
        }}
      >
        <MemoryRouter>
          <Main />
        </MemoryRouter>
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });
});
