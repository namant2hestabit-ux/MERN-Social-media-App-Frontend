import React from "react";
import { render, screen } from "@testing-library/react";
import Loader from "../../src/components/Loader";

describe("Loader Component", () => {
  it("renders without crashing", () => {
    const { container } = render(<Loader />);
    expect(container).toBeInTheDocument();
  });

  it("contains the main loader wrapper", () => {
    render(<Loader />);
    const loader = document.querySelector(".loader-square");
    expect(loader).toBeInTheDocument();
  });

  it("renders spinner-square container", () => {
    render(<Loader />);
    const spinner = document.querySelector(".spinner-square");
    expect(spinner).toBeInTheDocument();
  });

  it("renders three square elements inside spinner", () => {
    render(<Loader />);
    const squares = document.querySelectorAll(".spinner-square .square");
    expect(squares.length).toBe(3);
  });

  it("each square has correct class naming pattern", () => {
    render(<Loader />);
    expect(document.querySelector(".square-1")).toBeInTheDocument();
    expect(document.querySelector(".square-2")).toBeInTheDocument();
    expect(document.querySelector(".square-3")).toBeInTheDocument();
  });
});
