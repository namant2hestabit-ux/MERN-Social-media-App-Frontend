import React, { useEffect, useState } from "react";
import "./index.css";
import api from "../../api/api";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/user-posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (postId) => {
    try {
      await api.delete(`/post/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.log(err);
    }
  };

  const saveUpdatedPost = async (postId) => {
    try {
      const res = await api.patch(`/post/${postId}`, { title: updatedTitle });

      setPosts(
        posts.map((p) =>
          p._id === postId ? { ...p, title: res.data.post.title } : p
        )
      );

      setEditingPost(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="myposts-container">
      <h2 className="heading">My Posts</h2>

      {posts.length === 0 ? (
        <p className="no-posts">You haven't posted anything yet.</p>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div className="post-card-profile" key={post._id}>
              <img
                src={
                  post?.imageURL ||
                  "https://t4.ftcdn.net/jpg/16/79/44/21/240_F_1679442196_OEsi0AFKie6hYMBpvmXwwRgRYGV4U6Lz.jpg"
                }
                alt=""
                className="post-img"
              />

              {editingPost === post._id ? (
                <>
                  <input
                    type="text"
                    className="edit-input"
                    value={updatedTitle}
                    onChange={(e) => setUpdatedTitle(e.target.value)}
                  />
                  <button
                    className="save-btn"
                    onClick={() => saveUpdatedPost(post._id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingPost(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p className="post-title">{post.title}</p>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingPost(post._id);
                        setUpdatedTitle(post.title);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deletePost(post._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
