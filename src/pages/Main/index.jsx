import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import { useState } from "react";
import { useEffect } from "react";
import { lazy, Suspense } from "react";
import Loader from "../../components/Loader";

// Lazy imports
const Feed = lazy(() => import("../../components/Feed"));
const Profile = lazy(() => import("../../components/Profile"));
const Chat = lazy(() => import("../../components/Chat"));
const CreatePost = lazy(() => import("../../components/CreatePost"));
const MyPosts = lazy(() => import("../../components/MyPosts"));

const Main = () => {
  // Initialize from localStorage if available
  const [active, setActive] = useState(
    localStorage.getItem("activeTab") || "Home"
  );

  // Keep tab stored in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", active);
  }, [active]);

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  if (!user) return null;
  useEffect(() => {
    if (!user) {navigate("/login")};
  }, [user]);

  return (
    <div>
      <Navbar active={active} setActive={setActive} />
      <div className="body">
        {/* Suspense shows fallback while the component is loading */}
        <Suspense fallback={<Loader />}>
          {active === "Home" && <Feed />}
          {active === "Profile" && <Profile />}
          {active === "Chat" && <Chat />}
          {active === "Create" && <CreatePost />}
          {active === "Logout" && <MyPosts />}
        </Suspense>
      </div>
    </div>
  );
};

export default Main;
