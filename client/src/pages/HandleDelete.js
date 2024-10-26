import { toast } from 'react-toastify';

export const handleDelete = (id, navigate) => {
  toast.warn(
    <div>
      <p>Are you sure you want to delete this post?</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <button
          onClick={() => {
            deletePost(id, navigate);
            toast.dismiss('confirm-delete');
          }}
          style={{ 
            padding: '8px', 
            backgroundColor: 'red', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss('confirm-delete')}
          style={{ 
            padding: '8px', 
            backgroundColor: 'gray', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          No
        </button>
      </div>
    </div>,
    {
      position: 'top-center',
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      pauseOnHover: true,
      toastId: 'confirm-delete',
    }
  );
};

const deletePost = (id, navigate) => {
  fetch(`https://inkspace-1.onrender.com/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
    .then((res) => {
      if (res.ok) {
        toast.success('Post deleted successfully!', { position: 'bottom-right' });
        navigate('/posts');
      } else {
        toast.error('Failed to delete the post.', { position: 'bottom-right' });
      }
    })
    .catch((error) => {
      console.error('Delete error:', error);
      toast.error('An error occurred. Please try again.', { position: 'bottom-right' });
    });
};
