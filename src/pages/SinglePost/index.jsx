import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import api from "../../api/api";
import Loader from "../../components/Loader";
import { lazy, Suspense } from "react";


// Lazy imports
const Comments = lazy(() => import("../../components/Comments"));

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [openComments, setOpenComments] = useState(null);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/post/${id}`);
      if (res.status === 200) setPost(res.data.post);
    } catch (err) {
      console.log("Error fetching post", err);
    }
  };

  const handleSendComment = async () => {
    if (!commentMessage) return;

    try {
      const res = await api.post(`/comment/${id}`, { comment: commentMessage });

      if (res.status === 201) {
        setCommentMessage("");
        fetchPost();
      }
    } catch (err) {
      console.log("Error posting comment:", err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  if (!post) return <Loader />;

  return (
    <div className="single-post">
      <h3>{post?.author?.firstName}</h3>
      <hr class="white-line"></hr>
      <h2>{post.title}</h2>
      {post.imageURL && <img src={post.imageURL} alt="post" />}

      <h4>{post?.comments.length || ""} Comments</h4>
      {post.comments.length === 0 && <p>No comments yet</p>}

      {post.comments.length !== 0 && (
        <div className="post-actions">
          <button
            onClick={() =>
              setOpenComments(openComments === post._id ? null : post._id)
            }
          >
            {openComments ? "Hide Comments" : "Show Comments"}
          </button>
        </div>
      )}
      {openComments === post._id && (
        <div className="comments-container">
          <Suspense fallback={<div>Loading comments....</div>}>
            <Comments postId={post._id} />
          </Suspense>
          
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Add comment..."
          value={commentMessage}
          onChange={(e) => setCommentMessage(e.target.value)}
        />
        <button onClick={handleSendComment}>Send</button>
      </div>
    </div>
  );
};

export default SinglePost;
