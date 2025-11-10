import React, { useEffect, useState } from "react";
import "./index.css";
import api from "../../api/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Comments = ({ postId }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comment/${postId}`);
      setComments(res.data.comment);
    } catch (error) {
      console.log("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await api.delete(isAdmin ? `admin/comment/${commentId}` :`/comment/${commentId}`);

      if (res.status === 201) {
        setComments(comments.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error in deling data"
      );
      console.log("Error deleting comment:", err);
    }
  };

  const handleEdit = async (commentId) => {
    try {
      const res = await api.patch(`/comment/${commentId}`, {
        comment: editedText,
      });

      if (res.status === 201) {
        setComments(
          comments.map((c) =>
            c._id === commentId ? { ...c, comment: editedText } : c
          )
        );
        setEditingCommentId(null); // close edit UI
      }
    } catch (err) {
      console.log("Error editing comment:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  if (loading) return <p className="loading">Loading comments...</p>;

  return (
    <div className="comment-section">
      <h3>Comments</h3>

      {comments.length === 0 && <p>No comments yet.</p>}

      {comments.map((c) => (
        <div className="comment-card" key={c._id}>
          <div className="comment-author">
            <strong>{c.user?.firstName || "User"}</strong>
            <span className="date">
              {new Date(c.createdAt).toLocaleDateString()}
            </span>
          </div>

          {editingCommentId === c._id ? (
            <>
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
              <button onClick={() => handleEdit(c._id)}>Save</button>
              <button onClick={() => setEditingCommentId(null)}>Cancel</button>
            </>
          ) : (
            <p>{c.comment}</p>
          )}

          <div className="comment-actions">
            <button
              onClick={() => {
                setEditingCommentId(c._id);
                setEditedText(c.comment);
              }}
            >
              Edit
            </button>

            <button onClick={() => handleDelete(c._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;
