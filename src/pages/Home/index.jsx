import React from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <nav className="home-nav">
        <p id="logo">CONNETIFY</p>
        <button onClick={() => navigate("/login")}>Sign Up/Login</button>
      </nav>
      <div className="main">
        <div className="txt">
          <h2>Stay Connected With Your World</h2>
          <p>
            Share moments, follow your friends, and discover what’s happening
            around you. Connectify is a modern social platform made to bring
            people closer, anytime & anywhere.
          </p>
        </div>

        <div className="pictures">
          <div class="carousel3d-container">
            <div class="carousel3d-inner">
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1603320284370-d33c0e5ff086?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1633871771924-380d6123659b?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1571928002685-15aeba39a2d4?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1605643362116-ccf4302f9453?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1634473117419-92371b2bf457?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1697375805257-a5220aa18c55?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1698831695020-2e94ebfdfed7?fit=max&w=400"
                  alt=""
                />
              </div>
              <div class="carousel3d-card">
                <img
                  src="https://images.unsplash.com/photo-1577222960172-18c61acf6791?fit=max&w=400"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div className="brands">
          <img
            src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
            alt="facebook"
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/1384/1384017.png"
            alt="instagram"
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
            alt="twitter"
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
            alt="linkedin"
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png"
            alt="youtube"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
