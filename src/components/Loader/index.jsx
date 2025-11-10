import React from "react";
import "./index.css"

const Loader = () => {
  return (
    <div className="loader-square">
      <div class="spinner-square">
        <div class="square-1 square"></div>
        <div class="square-2 square"></div>
        <div class="square-3 square"></div>
      </div>
    </div>
  );
};

export default Loader;
