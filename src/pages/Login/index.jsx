import React, { useEffect } from "react";
import "./index.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, setUser } from "../../redux/authSlice";
import { signUpUser } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../api/api";
import { toast } from "react-toastify";
import validator from "validator";

const Login = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    console.log(user)
    if (user) navigate("/main");
  }, []);

  const responseGoogle = async (authResult) => {
    try {
      // We will get the code and send it to the server
      if (authResult["code"]) {
        const result = await api.post(`auth/google?code=${authResult["code"]}`);
        if (result.status === 200) {
          const { user } = result?.data;
          dispatch(setUser(user));
          navigate("/main");
          toast.success(result?.data?.message || "Google Login successfull");
        }
      }
    } catch (error) {
      console.log(`Error while requesting Google Code ${error}`);
      toast.error("Error in Google Login");
    }
  };

  // Validation with validator.js
  const validateSignUp = () => {
    if (validator.isEmpty(signUpData.firstName.trim())) {
      toast.error("First Name is required");
      return false;
    }
    if (!validator.isEmail(signUpData.email)) {
      toast.error("Enter a valid email");
      return false;
    }
    if (validator.isEmpty(signUpData.password)) {
      toast.error("Password is required");
      return false;
    }
    if (!validator.isLength(signUpData.password, { min: 6 })) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const validateSignIn = () => {
    if (!validator.isEmail(signInData.email)) {
      toast.error("Enter a valid email");
      return false;
    }
    if (validator.isEmpty(signInData.password)) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  // For Login through Google
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code", // To first req auth code from Server
  });

  const handleSignInChange = (event) => {
    const { name, value } = event.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (event) => {
    const { name, value } = event.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    console.log("Hello");
    e.preventDefault();
    if (!validateSignUp()) return;
    dispatch(signUpUser(signUpData));
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!validateSignIn()) return;
    dispatch(loginUser(signInData))
      .unwrap()
      .then((data) => {
        if (data.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/main");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="top-login-signup-container">
        <div
          className={`container ${isSignIn ? "" : "right-panel-active"}`}
          id="container"
        >
          <div className="form-container sign-up-container">
            <form className="login-form">
              <h1>Sign Up</h1>
              <div className="social-container">
                <a href="#" className="social">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social" onClick={googleLogin}>
                  <i className="fab fa-google-plus-g"></i>
                </a>
                <a href="#" className="social">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
              <span>or use your email for registration</span>
              <input
                type="text"
                value={signUpData.firstName}
                onChange={handleSignUpChange}
                name="firstName"
                placeholder="First Name"
              />
              <input
                type="text"
                name="lastName"
                value={signUpData.lastName}
                onChange={handleSignUpChange}
                placeholder="Last Name"
              />
              <input
                type="email"
                name="email"
                value={signUpData.email}
                onChange={handleSignUpChange}
                placeholder="Email"
              />
              <input
                type="password"
                name="password"
                value={signUpData.password}
                onChange={handleSignUpChange}
                placeholder="Password"
              />
              <button data-testid="sign-up-btn" onClick={handleSignUp}>
                Sign Up
              </button>
            </form>
          </div>
          <div className="form-container sign-in-container">
            <form className="login-form">
              <h1>Sign In</h1>
              <div className="social-container">
                <a href="#" className="social">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="social"
                  data-testid="google-btn"
                  onClick={googleLogin}
                >
                  <i className="fab fa-google-plus-g"></i>
                </a>
                <a href="#" className="social">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
              <span>or use your email account</span>
              <input
                type="email"
                name="email"
                value={signInData.email}
                placeholder="Email"
                onChange={handleSignInChange}
              />
              <input
                type="password"
                name="password"
                value={signInData.password}
                onChange={handleSignInChange}
                placeholder="Password"
              />
              <a href="#">Forgot your password?</a>
              <button data-testid="sign-in-btn" onClick={handleSignIn}>
                Sign In
              </button>
            </form>
          </div>
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p className="login-para">
                  To stay connected with us please login with your personal info
                </p>
                <button
                  className="ghost"
                  id="SignIn"
                  onClick={() => setIsSignIn(true)}
                >
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>
                  Enter your personal details and start your journey with us{" "}
                </p>
                <button
                  className="ghost"
                  id="SignUp"
                  onClick={() => setIsSignIn(false)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
