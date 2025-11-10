import React, { useState } from "react";
import "./index.css";
import api from "../../api/api";
import { toast } from "react-toastify";

const CreatePost = () => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", description);
    if (image) formData.append("image", image);

    try {
      const res = await api.post("/create-post", formData);

      if (res.status === 201) {
        toast.success(res.data?.message || "Post created Successfully");
        setImage(null);
        setPreview(null);
        setDescription("");
      }

      console.log("Post response:", res.data);
    } catch (error) {
      console.log("Error in Create Post Component", error);
      toast.error(
        error.response?.data?.message || "Error in Create Post Component"
      );
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create New Post</h2>

      <form className="post-form" onSubmit={handleSubmit}>
        <textarea
          className="textarea-field"
          placeholder="Write a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="image-upload-label">
          Select Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
        </label>

        {preview && <img className="preview-img" src={preview} alt="preview" />}

        <button type="submit" className="submit-btn">
          Upload Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
