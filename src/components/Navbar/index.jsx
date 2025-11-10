import React from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import api from "../../api/api";
import { toast } from "react-toastify";

const Navbar = ({ active, setActive }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      const res = await api.post("/logout", {});
      if (res.status === 200) {
        dispatch(logout());
        navigate("/login");
        toast.success(res.data?.message || "Logged out successfully");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <nav className="left-side-nav">
      <div className="nav-logo">
        <div className="avatar">
          {user?.firstName[0].toUpperCase() || user?.email[0].toUpperCase()}
        </div>
      </div>
      <a
        href="#"
        className={active === "Home" ? "active" : ""}
        onClick={() => setActive("Home")}
        style={{ marginTop: "8rem" }}
      >
        <i className="material-icons">home</i>
        <span>Home</span>
      </a>
      <a
        href="#"
        data-testid="nav-profile"
        className={active === "Profile" ? "active" : ""}
        onClick={() => setActive("Profile")}
      >
        <i className="material-icons">person</i>
        <span>Profile</span>
      </a>
      <a
        href="#"
        data-testid="nav-create"
        className={active === "Create" ? "active" : ""}
        onClick={() => setActive("Create")}
      >
        <i className="material-icons">add_circle_outline</i>
        <span>Create Post</span>
      </a>
      <a
        href="#"
        data-testid="nav-chat"
        className={active === "Chat" ? "active" : ""}
        onClick={() => setActive("Chat")}
      >
        <i className="material-icons">chat</i>
        <span>Chat</span>
      </a>
      <a href="#" onClick={() => handleLogout()}>
        <i className="material-icons">logout</i>
        <span>Logout</span>
      </a>
    </nav>
  );
};

export default Navbar;
