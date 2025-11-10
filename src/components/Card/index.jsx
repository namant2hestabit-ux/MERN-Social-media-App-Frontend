import React from "react";
import "./index.css";
import { Link } from "react-router-dom";

const Card = ({ image, logo, description, date, firstName, postId }) => {
  const hasImage = Boolean(image);
  const shortDesc =
    description.length > 60
      ? description.substring(0, 60) + "..."
      : description;

  return (
    <div
      className={`hero-card ${
        hasImage ? "hero-card-primary" : "hero-card-secondary"
      }`}
    >
      {hasImage && (
        <img className="hero-card-profile-img" src={image} alt="post" />
      )}

      <div className="hero-card-desc-bg"></div>

      <div className="hero-card-logo">
        <div className="avatar">{firstName[0].toUpperCase()}</div>
      </div>

      <div className="hero-card-text">
        <p className="card-first-name">{firstName}</p>
        <p className="card-first-desc">{shortDesc}</p>
      </div>

      <div className="hero-card-date">
        <p>{date}</p>
      </div>

      <div className="hero-card-btn">
        <Link to={`/post/${postId}`}>
          Expand
        </Link>
      </div>
    </div>
  );
};

export default Card;
