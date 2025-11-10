import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./index.css";
import { setUser } from "../../redux/authSlice";
import MyPosts from "../MyPosts";
import api from "../../api/api";

const Profile = () => {
  const { user: reduxUser } = useSelector((state) => state.auth || {});

  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(reduxUser || {});
  const [loading, setLoading] = useState(!reduxUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (reduxUser) {
        setProfileData(reduxUser);
        setForm({
          firstName: reduxUser.firstName || "",
          lastName: reduxUser.lastName || "",
          email: reduxUser.email || "",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/profile");
        const fetchedUser = res.data.user;
        setProfileData(fetchedUser);
        setForm({
          firstName: fetchedUser.firstName || "",
          lastName: fetchedUser.lastName || "",
          email: fetchedUser.email || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [reduxUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await api.patch(`/edit-profile`, {
        firstName: form.firstName,
        lastName: form.lastName,
      });

      // expect updated user in response
      const updated = res.data.user || {
        ...profileData,
        firstName: form.firstName,
        lastName: form.lastName,
      };

      setProfileData(updated);
      dispatch(setUser(updated));
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">Loading profile…</div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              {(profileData.firstName || "U")[0].toUpperCase()}
              {(profileData.lastName || "")[0]?.toUpperCase() || ""}
            </div>
            <div className="profile-basic">
              <h2 className="profile-name">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <div className="profile-email">{profileData.email}</div>
            </div>

            <div className="profile-actions">
              {!editing ? (
                <button
                  className="btn primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="btn primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        firstName: profileData.firstName || "",
                        lastName: profileData.lastName || "",
                        email: profileData.email || "",
                      });
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-section">
              <h3>Basic Info</h3>

              {editing ? (
                <div className="form-grid">
                  <label>
                    First name
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Last name
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Email
                    <input name="email" value={form.email} disabled />
                    <small className="muted">
                      Email cannot be changed here
                    </small>
                  </label>
                </div>
              ) : (
                <div className="info-grid">
                  <div>
                    <strong>First name</strong>
                    <div>{profileData.firstName}</div>
                  </div>
                  <div>
                    <strong>Last name</strong>
                    <div>{profileData.lastName}</div>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <div>{profileData.email}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-section">
              <h3>Account</h3>
              <div className="info-grid">
                <div>
                  <strong>User ID</strong>
                  <div className="muted">{profileData._id}</div>
                </div>
                {profileData.createdAt && (
                  <div>
                    <strong>Joined</strong>
                    <div className="muted">
                      {new Date(profileData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="error">{error}</div>}
          </div>
        </div>
      </div>
      <MyPosts />
    </>
  );
};

export default Profile;
