import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Profile from "../../src/components/Profile";
import api from "../../src/api/api";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../src/redux/authSlice";

// Mocks
vi.mock("../../src/api/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../src/redux/authSlice", () => ({
  setUser: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock("../../src/components/MyPosts", () => ({
  default: () => <div data-testid="myposts">MyPosts Component</div>,
}));


describe("Profile Component", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  // Utility render with mock Redux user
  const renderWithUser = (user) => {
    useSelector.mockReturnValue({ user });
    return render(<Profile />);
  };

  it("renders loading state when no user is in Redux", async () => {
    useSelector.mockReturnValue({ user: null });
    api.get.mockResolvedValueOnce({
      data: { user: { firstName: "John", lastName: "Doe", email: "john@example.com" } },
    });

    render(<Profile />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  it("renders profile data from Redux immediately", () => {
    const user = {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      _id: "12345",
    };

    renderWithUser(user);

    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
    expect(screen.getAllByText(/alice@example.com/i)).toHaveLength(2);
  });

  it("toggles edit mode when clicking 'Edit Profile'", () => {
    const user = { firstName: "Bob", lastName: "Lee", email: "bob@example.com" };
    renderWithUser(user);

    const editButton = screen.getByText(/edit profile/i);
    fireEvent.click(editButton);

    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it("updates input fields and saves successfully", async () => {
    const user = { firstName: "Sam", lastName: "Green", email: "sam@example.com" };
    renderWithUser(user);

    // Enter edit mode
    fireEvent.click(screen.getByText(/edit profile/i));

    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: "Samuel" } });

    // Mock API patch success
    api.patch.mockResolvedValueOnce({
      data: { user: { ...user, firstName: "Samuel" } },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/edit-profile", {
        firstName: "Samuel",
        lastName: "Green",
      });
      expect(setUser).toHaveBeenCalledWith({
        ...user,
        firstName: "Samuel",
      });
    });
  });

  it("shows error message when save fails", async () => {
    const user = { firstName: "Tom", lastName: "H", email: "tom@example.com" };
    renderWithUser(user);

    fireEvent.click(screen.getByText(/edit profile/i));

    api.patch.mockRejectedValueOnce(new Error("Network Error"));
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText(/failed to save changes/i)).toBeInTheDocument();
    });
  });

  it("renders MyPosts component", () => {
    renderWithUser({ firstName: "Anna", lastName: "Bell", email: "anna@example.com" });
    expect(screen.getByTestId("myposts")).toBeInTheDocument();
  });
});
