import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Main from "./pages/Main";
import ProtectedRoute from "./pages/ProtectedRoute";
import SinglePost from "./pages/SinglePost";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminRoute from "./pages/AdminRoute";
import Admin from "./pages/Admin";
import PageNotFound from "./pages/PageNotFound";

function App() {
  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId="184349153849-ep6qk4ni3d0ondrp2vsq381uh2c719vr.apps.googleusercontent.com">
        <Login />
      </GoogleOAuthProvider>
    );
  };
  return (
    <div>
      <Routes>
        <Route path="/login" element={<GoogleAuthWrapper />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <SinglePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
