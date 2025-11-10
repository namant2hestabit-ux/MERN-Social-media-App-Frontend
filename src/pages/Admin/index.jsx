import React, { useEffect, useState } from "react";
import "./index.css";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      dispatch(logout());
      toast.success("Logged out");
      navigate("/login");
    } catch (e) {
      console.error(e);
      toast.error("Logout failed");
    }
  };

  const fetchData = async () => {
    try {
      const [usersRes, postsRes] = await Promise.all([
        api.get("/users"),
        api.get("/posts"),
      ]);
      setUsers(usersRes.data.users);
      setPosts(postsRes.data.posts);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load admin data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditUser = (user) => {
    console.log(user);
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });
  };

  const handleSaveUser = async () => {
    try {
      console.log(editingUser);
      await api.patch(
        `/admin/user/${editingUser._id}`,
        editingUser.email === formData.email
          ? { firstName: formData.firstName, lastName: formData.lastName }
          : formData
      );
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Topbar with Logout */}
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Admin Panel</h1>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <aside className="admin-sidebar">
        <h2>Manage</h2>
        <nav>
          <a href="#users">Users</a>
          <a href="#posts">Posts</a>
        </nav>
      </aside>

      <main className="admin-main">
        <h1>Dashboard Overview</h1>

        {/* USERS SECTION */}
        <section id="users" className="admin-section">
          <h2>Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditUser(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={async () => {
                        try {
                          await api.delete(`/admin/user/${u._id}`);
                          toast.success("User deleted");
                          fetchData();
                        } catch {
                          toast.error("Delete failed");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Inline Edit Modal */}
          {editingUser && (
            <div className="edit-modal">
              <div className="edit-modal-content">
                <h3>Edit User</h3>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Last Name"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email"
                />

                <div className="edit-modal-actions">
                  <button className="save-btn" onClick={handleSaveUser}>
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* POSTS SECTION */}
        <section id="posts" className="admin-section">
          <h2>Posts</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.author?.firstName}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/post/${p._id}`)}
                    >
                      Expand
                    </button>
                    {p._id}
                    <button
                      className="delete-btn"
                      onClick={async () => {
                        try {
                          await api.delete(`/admin/post/${p._id}`);
                          toast.success("Post deleted");
                          fetchData();
                        } catch {
                          toast.error("Delete failed");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Admin;
