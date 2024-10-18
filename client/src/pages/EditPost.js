import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/posts/${id}`)
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
        fetch(`/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: values.title,
                content: values.content,
                categories: values.categories.split(',').map(cat => cat.trim()), // Convert string to array
            }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                alert('Post updated successfully!');
                navigate(`/posts/${data.id}`); // Navigate back to the updated post
            })
            .catch(error => {
                console.error('Error updating post:', error);
                alert('Failed to update the post');
            });
    };

    const handleCancel = () => {
        navigate(`/posts/${id}`); // Navigate back to the post detail page
    };

    return (
        <div className='container mx-auto p-6'>
            <h1 className='text-3xl mb-4'>Edit Post</h1>
            <Formik
                initialValues={{
                    title: post.title,
                    content: post.content,
                    categories: post.categories.map(category => category.name).join(', '), // Assuming categories is an array of objects
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
                        <div className='flex justify-between'>
                            <button
                                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                                type='submit'
                                disabled={isSubmitting}
                            >
                                Update Post
                            </button>
                            <button
                                type='button'
                                onClick={handleCancel}
                                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
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