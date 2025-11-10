import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Navbar from "../../src/components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../src/api/api";
import { toast } from "react-toastify";
import { logout } from "../../src/redux/authSlice";

// === Mocks ===

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

// Mock redux hooks
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

// Mock API module
vi.mock("../../src/api/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock logout action
vi.mock("../../src/redux/authSlice", () => ({
  logout: vi.fn(),
}));

describe("Navbar Component", () => {
  const mockDispatch = vi.fn();
  const mockNavigate = vi.fn();
  const mockSetActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useSelector.mockReturnValue({
      user: { firstName: "John", email: "john@example.com" },
    });
  });

  // Utility render
  const renderNavbar = (active = "Home") =>
    render(<Navbar active={active} setActive={mockSetActive} />);

  // === TESTS ===

  it("renders navigation links and avatar initials", () => {
    renderNavbar();

    expect(screen.getAllByText(/home/i)).toHaveLength(2);
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getAllByText(/chat/i)).toHaveLength(2);
    expect(screen.getAllByText(/logout/i)).toHaveLength(2);

    // Avatar should show initials "J"
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("highlights active link correctly", () => {
    renderNavbar("Profile");
    const profileLink = screen.getByText(/profile/i).closest("a");
    expect(profileLink).toHaveClass("active");
  });

  it("calls setActive when clicking on nav links", () => {
    renderNavbar();

    fireEvent.click(screen.getByTestId("nav-profile"));
    expect(mockSetActive).toHaveBeenCalledWith("Profile");

    fireEvent.click(screen.getByTestId("nav-chat"));
    expect(mockSetActive).toHaveBeenCalledWith("Chat");

    fireEvent.click(screen.getByTestId("nav-create"));
    expect(mockSetActive).toHaveBeenCalledWith("Create");
  });

  it("calls API and logs out successfully", async () => {
    api.post.mockResolvedValueOnce({
      status: 200,
      data: { message: "Logout success" },
    });

    renderNavbar();

    const logoutButton = screen.getAllByText(/logout/i);
    fireEvent.click(logoutButton[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/logout", {});
      expect(mockDispatch).toHaveBeenCalledWith(logout());
      expect(mockNavigate).toHaveBeenCalledWith("/login");
      expect(toast.success).toHaveBeenCalledWith("Logout success");
    });
  });

  it("handles logout API failure gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    renderNavbar();

    const logoutButton = screen.getAllByText(/logout/i);

    fireEvent.click(logoutButton[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled(); // should log the error
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
