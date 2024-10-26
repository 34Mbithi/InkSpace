import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import Navbar from '../components/NavBar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://inkspace-1.onrender.com/profile', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setProfile(data);
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile.');
      });
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      {/* <Navbar /> */}
      <div className="container mx-auto p-6 sm:mt-16">
      <Navbar />
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Username: {profile.username}</h2>
        <p className="text-gray-700">Email: {profile.email}</p>
      </div>

      <h3 className="text-xl font-bold mb-4">Your Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.posts.length > 0 ? (
          profile.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className="text-gray-500">You have no posts yet.</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default Profile;