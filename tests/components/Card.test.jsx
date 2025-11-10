import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Card from "../../src/components/Card";

describe("Card Component", () => {
  const baseProps = {
    image: "https://example.com/post.jpg",
    description: "A beautiful post about something interesting.",
    date: "2025-11-06",
    firstName: "John",
    postId: "123",
  };

  it("renders correctly with image", () => {
    render(
      <MemoryRouter>
        <Card {...baseProps} />
      </MemoryRouter>
    );

    expect(screen.getByAltText("post")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("A beautiful post about something interesting.")).toBeInTheDocument();
    expect(screen.getByText("2025-11-06")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /expand/i })).toHaveAttribute("href", "/post/123");
  });

  it("renders correctly without image", () => {
    render(
      <MemoryRouter>
        <Card {...baseProps} image={null} />
      </MemoryRouter>
    );

    // No image rendered
    expect(screen.queryByAltText("post")).not.toBeInTheDocument();

    // Still renders text content and link
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText(/A beautiful post about something interesting./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /expand/i })).toHaveAttribute("href", "/post/123");
  });

  it("displays truncated description if longer than 60 chars", () => {
    const longDesc =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    render(
      <MemoryRouter>
        <Card {...baseProps} description={longDesc} />
      </MemoryRouter>
    );

    const truncated = longDesc.substring(0, 60) + "...";
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it("renders the first letter of firstName in avatar", () => {
    render(
      <MemoryRouter>
        <Card {...baseProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
