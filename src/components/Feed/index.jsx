import React, { useEffect, useState, useRef } from "react";
import "./index.css";
import Card from "../Card";
import Loader from "../Loader";
import api from "../../api/api";

const Feed = () => {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const getFeedData = async (pageNum) => {
    try {
      setLoadingMore(true);

      const res = await api.get(`/posts?page=${pageNum}&limit=12`);
      if (res.status === 201) {
        const newPosts = res.data.posts || [];
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setFeedData((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const uniquePosts = newPosts.filter((p) => !ids.has(p._id));
            return [...prev, ...uniquePosts];
          });

          // update hasMore directly from backend
          setHasMore(res.data?.hasMore);
        }
      }
    } catch (err) {
      console.log("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch data on page change
  useEffect(() => {
    if (hasMore) getFeedData(page);
  }, [page]);

  // Intersection Observer
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "100px", threshold: 0.1 } // triggers a bit earlier
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [feedData, hasMore, loadingMore]);

  if (loading && page === 1) return <Loader />;

  return (
    <div className="feed-container">
      {feedData.length === 0 && !loading && <p>No posts available</p>}

      {feedData.map((post) => (
        <Card
          key={post._id}
          postId={post._id}
          image={post.imageURL}
          description={post.title}
          date={new Date(post.createdAt).toLocaleDateString()}
          firstName={post.author?.firstName}
        />
      ))}

      {hasMore && (
        <div ref={loaderRef} className="feed-loader">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Feed;
