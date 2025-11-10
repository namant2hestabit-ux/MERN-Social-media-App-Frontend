import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import "./index.css";
import api from "../../api/api";
import { toast } from "react-toastify";

const socket = io("https://mern-social-media-app-backend-z3xs.onrender.com", {
  withCredentials: true,
});

const Chat = () => {
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const messageEndRef = useRef(null);

  let typingTimeout;

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("addUser", user._id);

    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("getUsers");
  }, []);

  // Fetch all users
  const getUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users.filter((u) => u._id !== user._id));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error in getting user Data"
      );
    }
  };

  // Fetch messages between logged user & selected user
  const getMessages = async (receiverId) => {
    try {
      const res = await api.get(`/message/${receiverId}`);
      // console.log("Fetched messages:", res.data);
      setMessages(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error in getting user Chat Data"
      );
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;


    socket.emit("sendMessage", {
      sender: user._id,
      receiver: selectedUser._id,
      text,
    });

    await api.post("/message", {
      receiver: selectedUser._id,
      text,
    });

    setMessages((prev) => [
      ...prev,
      { sender: user._id, text, delivered: true, seen: false },
    ]);
    setText("");
  };

  // Check Typing
  useEffect(() => {
    socket.on("typing", (sender) => {
      if (sender === selectedUser._id) setIsTyping(true);
    });

    socket.on("stopTyping", (sender) => {
      if (sender === selectedUser._id) setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [selectedUser]);

  // Receive message realtime
  useEffect(() => {
    socket.emit("addUser", user._id);

    const handleMessage = (data) => {
      if (selectedUser && data.sender === selectedUser._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("getMessage", handleMessage);

    return () => {
      socket.off("getMessage", handleMessage);
    };
  }, [selectedUser, user._id]);

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "90vw",
        height: "100vh",
        marginLeft: "7vw",
      }}
    >
      <div className="chat-container">
        {/* Left user list */}
        <div className="user-list">
          <h3>Messages</h3>
          {users.map((u) => (
            <div
              key={u._id}
              className={`user-card ${
                selectedUser?._id === u._id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedUser(u);
                getMessages(u._id);
              }}
            >
              <span>{u.firstName}</span>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedUser ? (
            <>
              <div
                className={`chat-header user ${
                  onlineUsers.some((u) => u.userId === selectedUser._id)
                    ? "online"
                    : "offline"
                }`}
              >
                {selectedUser.firstName}
              </div>

              <div className="chat-body">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`message ${
                      msg.sender === user._id ? "sent" : "received"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <p className="typing-bubble">
                    {selectedUser.firstName} is typing...
                  </p>
                )}

                <div ref={messageEndRef}></div>
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={text}
                  placeholder="Type your message..."
                  onChange={(e) => {
                    setText(e.target.value);
                    socket.emit("typing", {
                      sender: user._id,
                      receiver: selectedUser._id,
                    });

                    clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => {
                      socket.emit("stopTyping", {
                        sender: user._id,
                        receiver: selectedUser._id,
                      });
                    }, 1000);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <p className="no-chat">Select a user to chat</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
