import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import CreatePost from "../../src/components/CreatePost";
import api from "../../src/api/api";
import { toast } from "react-toastify";

// ===== Mock Dependencies =====
vi.mock("../../src/api/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// ===== Test Suite =====
describe("CreatePost Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Renders UI correctly
  it("renders form elements correctly", () => {
    render(<CreatePost />);
    expect(screen.getByText(/create new post/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write a description/i)).toBeInTheDocument();
    expect(screen.getByText(/select image/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload post/i })).toBeInTheDocument();
  });

  // 2. Updates description input on change
  it("updates textarea value when user types", () => {
    render(<CreatePost />);
    const textarea = screen.getByPlaceholderText(/write a description/i);
    fireEvent.change(textarea, { target: { value: "My test post" } });
    expect(textarea.value).toBe("My test post");
  });

  // 3. Handles image upload and sets preview
  it("displays image preview when a file is selected", () => {
    render(<CreatePost />);
    const fileInput = screen.getByLabelText(/select image/i);

    const file = new File(["dummy content"], "test-image.png", { type: "image/png" });
    const createObjectURLMock = vi.fn(() => "blob:mock-preview");
    global.URL.createObjectURL = createObjectURLMock;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(createObjectURLMock).toHaveBeenCalledWith(file);
    expect(screen.getByAltText(/preview/i)).toHaveAttribute("src", "blob:mock-preview");
  });

  // 4. Submits form successfully
  it("submits the form and shows success toast", async () => {
    api.post.mockResolvedValueOnce({
      status: 201,
      data: { message: "Post created Successfully" },
    });

    render(<CreatePost />);

    const textarea = screen.getByPlaceholderText(/write a description/i);
    fireEvent.change(textarea, { target: { value: "Awesome post" } });

    const button = screen.getByRole("button", { name: /upload post/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/create-post",
        expect.any(FormData)
      );
      expect(toast.success).toHaveBeenCalledWith("Post created Successfully");
      expect(textarea.value).toBe("");
    });
  });

  // 5. Does not crash when API fails
  it("handles API failure gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    api.post.mockRejectedValueOnce(new Error("Upload failed"));

    render(<CreatePost />);
    fireEvent.click(screen.getByRole("button", { name: /upload post/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  // 6. Resets preview and file input after successful upload
  it("resets form fields after successful post creation", async () => {
    api.post.mockResolvedValueOnce({
      status: 201,
      data: { message: "Post uploaded" },
    });

    render(<CreatePost />);
    const textarea = screen.getByPlaceholderText(/write a description/i);
    fireEvent.change(textarea, { target: { value: "Reset test" } });

    const fileInput = screen.getByLabelText(/select image/i);
    const file = new File(["img"], "sample.png", { type: "image/png" });
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: /upload post/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(textarea.value).toBe("");
      expect(screen.queryByAltText(/preview/i)).not.toBeInTheDocument();
    });
  });
});
