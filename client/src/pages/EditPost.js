import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://inkspace-1.onrender.com/posts/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setPost(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                toast.error('Failed to fetch post.');
                setLoading(false);
            });
    }, [id]);

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        content: Yup.string().required('Content is required'),
        categories: Yup.string().required('At least one category is required'),
    });

    if (loading) {
        return <div className='container mx-auto p-6'>Loading...</div>;
    }

    const handleSubmit = (values) => {
        fetch(`https://inkspace-1.onrender.com/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: values.title,
                content: values.content,
                categories: values.categories.split(',').map(cat => cat.trim()), 
            }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            //.then(data => {
            //    alert('Post updated successfully!');
            //    navigate(`/posts/${data.id}`); 
            //})
            .then(() => {
                toast.success('Post updated successfully!');
                setTimeout(() => navigate(`/posts/${id}`), 1000);
              })
            .catch(error => {
                console.error('Error updating post:', error);
                //alert('Failed to update the post');
                toast.error('Failed to update post.');
            });
    };

    const handleCancel = () => {
        navigate(`/posts/${id}`); 
    };

    return (
        <div className='container mx-auto p-6'>
            <ToastContainer
                position="top-center"
                autoClose={3000}  // 3 seconds
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
            />
            <h1 className='text-3xl mb-4'>Edit Post</h1>
            <Formik
                initialValues={{
                    title: post.title,
                    content: post.content,
                    categories: post.categories.map(category => category.name).join(', '), 
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className='bg-white p-6 rounded-lg shadow-lg'>
                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='title'>
                                Title
                            </label>
                            <Field
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                type='text'
                                name='title'
                            />
                            <ErrorMessage name='title' component='div' className='text-red-500 text-xs italic' />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='content'>
                                Content
                            </label>
                            <Field
                                as='textarea'
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64' // Increased height
                                name='content'
                            />
                            <ErrorMessage name='content' component='div' className='text-red-500 text-xs italic' />
                        </div>
                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Categories</label>
                            <Field
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                type='text'
                                name='categories'
                            />
                            <p className='text-gray-500 text-xs italic'>Enter categories separated by commas.</p>
                            <ErrorMessage name='categories' component='div' className='text-red-500 text-xs italic' />
                        </div>
                        <div className='flex flex-col sm:flex-row justify-between'>
                            <button
                                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2 sm:mb-0 sm:mr-2'
                                type='submit'
                                disabled={isSubmitting}
                            >
                                Update Post
                            </button>
                            <button
                                type='button'
                                onClick={handleCancel}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300"  
                            >
                                Cancel
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default EditPost;
