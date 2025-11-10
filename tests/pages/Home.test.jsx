import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Home from "../../src/pages/Home";

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the home page correctly", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Header & logo
    expect(screen.getByText(/CONNETIFY/i)).toBeInTheDocument();

    // Main title
    expect(
      screen.getByText(/Stay Connected With Your World/i)
    ).toBeInTheDocument();

    // Description paragraph
    expect(
      screen.getByText(/Share moments, follow your friends/i)
    ).toBeInTheDocument();

    // Button exists
    expect(
      screen.getByRole("button", { name: /Sign Up\/Login/i })
    ).toBeInTheDocument();
  });

  it("navigates to /login when button is clicked", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign Up\/Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders carousel images", () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Select Unsplash images by their src pattern
    const unsplashImages = container.querySelectorAll(
      '.carousel3d-card img[src*="unsplash"]'
    );

    expect(unsplashImages.length).toBe(8);

    // Optional: verify first image URL pattern
    expect(unsplashImages[0].src).toMatch(/unsplash\.com/);
  });

  it("renders brand logos", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const brandIcons = [
      "facebook",
      "instagram",
      "twitter",
      "linkedin",
      "youtube",
    ];

    brandIcons.forEach((brand) => {
      expect(screen.getByAltText(brand)).toBeInTheDocument();
    });
  });
});
