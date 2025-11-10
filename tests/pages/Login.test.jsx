import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../../src/pages/Login";

// Mock Redux
const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => mockDispatch,
}));

// Mock Redux actions
const mockLoginUser = vi.fn(() => ({
  unwrap: () => Promise.resolve({ user: { role: "user" } }),
}));
const mockSignUpUser = vi.fn();
const mockSetUser = vi.fn();

vi.mock("../../src/redux/authSlice", () => ({
  loginUser: (data) => mockLoginUser(data),
  signUpUser: (data) => mockSignUpUser(data),
  setUser: (data) => mockSetUser(data),
}));


// Mock Router navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Google OAuth
vi.mock("@react-oauth/google", () => ({
  useGoogleLogin: vi.fn(({ onSuccess, onError }) => {
    // Return a function that can simulate both outcomes
    return (shouldSucceed = true) => {
      if (shouldSucceed) {
        // Simulate Google login success
        onSuccess({ code: "mock-auth-code" });
      } else {
        // Simulate Google login failure
        onError({ error: "mock-error" });
      }
    };
  }),
}));

// Mock API
vi.mock("../../src/api/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from "../../src/api/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders both Sign In and Sign Up forms", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Sign In/i)).toHaveLength(3);
    expect(screen.getAllByText(/Sign Up/i)).toHaveLength(3);
  });

  it("toggles between SignIn and SignUp forms", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const [formSignUpBtn, overlaySignUpBtn] = screen.getAllByRole("button", {
      name: /sign up/i,
    });

    fireEvent.click(overlaySignUpBtn); // toggle panel

    const [formSignInBtn, overlaySignInBtn] = screen.getAllByRole("button", {
      name: /sign in/i,
    });

    fireEvent.click(overlaySignInBtn); // toggle panel

    // Switch to SignUp
    fireEvent.click(screen.getByText(/Hello, Friend!/i));
    expect(formSignUpBtn).toBeInTheDocument();

    // Switch back to SignIn
    fireEvent.click(formSignInBtn);
    expect(screen.getAllByText(/sign up/i)).toHaveLength(3);
  });

    it("validates Sign Up form fields", async () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      // Switch to SignUp view
      fireEvent.click(screen.getByText(/Hello, Friend!/i));

      const signUpButton = screen.getAllByText(/Sign Up/i)[1]; // 2nd one inside form
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("First Name is required");
      });
    });

    it("submits valid Sign Up data", async () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      // Switch to SignUp view
      fireEvent.click(screen.getByText(/Hello, Friend!/i));

      fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
        target: { value: "John" },
      });
      const [signUpEmail, signInEmail] = screen.getAllByPlaceholderText(/Email/i);
      fireEvent.change(signUpEmail, {
        target: { value: "john@mail.com" },
      });

      const [signUpPass, signInPass] = screen.getAllByPlaceholderText(/Password/i);

      fireEvent.change(signUpPass, {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByTestId("sign-up-btn"));


      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockSignUpUser).toHaveBeenCalledWith(
          expect.objectContaining({ email: "john@mail.com" })
        );
      });
    });

    it("validates Sign In form", async () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByTestId("sign-in-btn"));


      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Enter a valid email");
      });
    });

  it("handles Google login error", async () => {
    api.post.mockRejectedValueOnce(new Error("Google Error"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // const googleBtn = screen.getAllByRole("link")[1];
    // const googleBtn = screen.getAllByRole("link");
    fireEvent.click(screen.getByTestId("google-btn"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error in Google Login");
    });
  });
});
