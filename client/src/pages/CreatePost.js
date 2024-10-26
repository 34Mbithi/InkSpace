import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from '../images/background.jpg';

const validate = values => {
  const errors = {};
  if (!values.title) {
    errors.title = 'Title is required';
  }
  if (!values.content) {
    errors.content = 'Content is required';
  }
  return errors;
};

const CreatePost = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(['']); // State to manage category inputs

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
    },
    validate,
    onSubmit: values => {
      // Combine form values with categories
      const postData = {
        ...values,
        categories: categories.filter(category => category !== ''),
      };

      fetch('https://inkspace-1.onrender.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Post created:', data);
          navigate('/posts');
        });
    },
  });

  // Handle adding a new category input field
  const addCategoryField = () => {
    setCategories([...categories, '']);
  };

  // Handle changing category input values
  const handleCategoryChange = (index, value) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  // Handle removing a category
  const removeCategoryField = index => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleCancel = () => {
    formik.resetForm();
    setCategories(['']);
    navigate('/posts');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-gray-900 p-10 max-w-md w-full rounded-lg shadow-lg">
        <h1 className="text-2xl text-white mb-6 text-center">Create New Post</h1>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <input
              id="title"
              name="title"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
              placeholder="Title"
              className="w-full p-3 border border-blue-700 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {formik.errors.title && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
            )}
          </div>

          <div className="mb-4">
            <textarea
              id="content"
              name="content"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.content}
              placeholder="Content"
              className="w-full p-3 border border-blue-700 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              rows="4"
            />
            {formik.errors.content && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.content}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Categories</label>
            {categories.map((category, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={category}
                  onChange={e => handleCategoryChange(index, e.target.value)}
                  className="w-full p-3 border border-blue-700 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter a category"
                />
                <button
                  type="button"
                  onClick={() => removeCategoryField(index)}
                  className="text-red-500 ml-2"
                >
                  x
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCategoryField}
              className="text-blue-500 underline hover:text-blue-600"
            >
              Add Category
            </button>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
