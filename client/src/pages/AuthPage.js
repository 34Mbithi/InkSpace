import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import BackgroundImage from '../images/background.jpg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleError = (message) => setError(message);

  const loginFormik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values) => {
      fetch('https://inkspace-1.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
        .then((response) => {
          if (response.ok) {
            navigate('/posts');
          } else {
            handleError('Invalid credentials');
          }
        })
        .catch(() => handleError('Login error'));
    },
  });

  const signupFormik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: (values) => {
      fetch('https://inkspace-1.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            Cookies.set('token', data.token, { expires: 7 });
            navigate('/posts');
          } else {
            handleError('Sign-up failed');
          }
        })
        .catch(() => handleError('Sign-up error'));
    },
  });

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
        <ul className="flex justify-around mb-10">
          <li
            className={`cursor-pointer p-2 w-full text-center ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            } rounded-lg`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </li>
          <li
            className={`cursor-pointer p-2 w-full text-center ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            } rounded-lg`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </li>
        </ul>

        <div>
          {isLogin ? (
            <LoginForm formik={loginFormik} error={error} />
          ) : (
            <SignupForm formik={signupFormik} error={error} />
          )}
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ formik, error }) => (
  <div>
    <h1 className="text-2xl text-white mb-6">Welcome Back!</h1>
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-6">
        <input
          type="email"
          name="email"
          onChange={formik.handleChange}
          value={formik.values.email}
          placeholder="Email"
          className="w-full p-3 border border-blue-600 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div className="mb-6">
        <input
          type="password"
          name="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          placeholder="Password"
          className="w-full p-3 border border-blue-600 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          required
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-600 transition"
      >
        Login
      </button>
    </form>
  </div>
);

const SignupForm = ({ formik, error }) => (
  <div>
    <h1 className="text-2xl text-white mb-6">Register</h1>
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-6">
        <input
          type="text"
          name="name"
          onChange={formik.handleChange}
          value={formik.values.name}
          placeholder="Name"
          className="w-full p-3 border border-blue-600 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div className="mb-6">
        <input
          type="email"
          name="email"
          onChange={formik.handleChange}
          value={formik.values.email}
          placeholder="Email"
          className="w-full p-3 border border-blue-600 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div className="mb-6">
        <input
          type="password"
          name="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          placeholder="Password"
          className="w-full p-3 border border-blue-600 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-600 transition"
      >
        Sign Up
      </button>
    </form>
  </div>
);

export default AuthPage;
