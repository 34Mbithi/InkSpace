import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import { handleDelete } from './HandleDelete'; 

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        fetch(`https://inkspace-1.onrender.com/posts/${id}`)
            .then(res => res.json())
            .then(data => {
                setPost(data);
                return fetch('/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
            })
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setUserId(data.id);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [id]);

    // const handleDelete = () => {
    //     if (window.confirm('Are you sure you want to delete this post?')) {
    //         fetch(`/posts/${id}`, {
    //             method: 'DELETE',
    //             credentials: 'include',
    //         })
    //             .then(res => {
    //                 if (res.ok) {
    //                     //alert('Post deleted successfully');
    //                     toast.success('Post deleted successfully!');
    //                     navigate('/posts');
    //                 } else {
    //                     //alert('Failed to delete the post');
    //                     toast.success('Failed to delete the post');
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error('Delete error:', error);
    //             });
    //     }
    // };
  

    const handleEdit = () => {
        navigate(`/posts/edit/${id}`);
    };

    const handleNext = () => {
        navigate(`/posts/${parseInt(id) + 1}`);
    };

    const handleBack = () => {
        if (parseInt(id) > 1) {
            navigate(`/posts/${parseInt(id) - 1}`);
        } else {
            navigate('/posts');
        }
    };

    const initialValues = { content: '' }; 

    const validationSchema = Yup.object({
        content: Yup.string()
            .required('Comment is required')
            .min(1, 'Comment must be at least 1 character long')
            .max(500, 'Comment cannot exceed 500 characters'),
    });

    const handleCommentSubmit = (values, { resetForm }) => {
        fetch(`https://inkspace-1.onrender.com/posts/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: values.content }),
        })
            .then(res => {
                if (res.ok) {
                    return res.json(); 
                }
                throw new Error('Failed to add comment');
            })
            .then(data => {
                setComments([...comments, data]); 
                resetForm(); 
            })
            .catch(error => {
                console.error('Error adding comment:', error);
            });
    };

    if (!post) {
        return <div className='container mx-auto p-6'>Post not found</div>;
    }

    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className='bg-gray-50 min-h-screen p-6'>
            <ToastContainer />
            <div className='container mx-auto bg-white p-8 rounded-lg shadow-lg'>
                <h1 className='text-4xl font-bold mb-4'>{post.title}</h1>
                <p className='text-gray-600 mb-4'>by {post.author.username} - {formattedDate}</p>
                <div className='mt-6 text-gray-800'>
                    {post.content}
                </div>
                <div className='mt-6'>
                    <h3 className='text-lg font-semibold mb-2'>Categories:</h3>
                    <ul className='flex flex-wrap space-x-2'>
                        {post.categories && post.categories.map((category, index) => (
                            <li key={index} className='bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm'>
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
                {userId === post.author.id && (
                    <div className='mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
                        <button 
                            onClick={handleEdit} 
                            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
                            Edit
                        </button>
                        <button 
                            //onClick={handleDelete} 
                            onClick={() => handleDelete(id, navigate)} 
                            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
                            Delete
                        </button>
                    </div>
                )}
                <div className='mt-6 flex justify-between'>
                    <button 
                        onClick={handleBack} 
                        className='bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400'>
                        Back
                    </button>
                    <button 
                        onClick={handleNext} 
                        className='bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400'>
                        Next
                    </button>
                </div>
                <div className='mt-8'>
                    <h3 className='text-lg font-semibold mb-2'>Comments:</h3>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className='bg-gray-100 p-4 mb-4 rounded-lg'>
                                <p className='text-gray-800 mb-1'>{comment.content}</p>
                                <p className='text-sm text-gray-600'>
                                    by {comment.author.username} - {comment.created_at ? new Date(comment.created_at.split(' ')[0]).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }) : 'Unknown date'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className='text-gray-500'>No comments yet. Be the first to comment!</p>
                    )}
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleCommentSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className='mt-4'>
                                <Field 
                                    as='textarea'
                                    name='content' 
                                    placeholder='Add a comment...' 
                                    rows='3' 
                                    className='w-full p-2 border border-gray-300 rounded mb-2'
                                />
                                <ErrorMessage name='content' component='div' className='text-red-500 text-sm mb-2' />
                                <button 
                                    type='submit' 
                                    disabled={isSubmitting}
                                    className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                                >
                                    Comment
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;