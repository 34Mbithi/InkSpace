#!/usr/bin/env python3

# Standard library imports
from datetime import datetime
from functools import wraps

# Remote library imports
from flask import make_response, request, session, jsonify, abort
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError

# Local imports
from config import app, db, api
from models import User, BlogPost, Category, Comment

# Secret key for sessions
app.config['SECRET_KEY'] = 'f550003f7c3dc2211c5ef4ec3a1f50ce123e11ec4b40f23aeb5ebbd88c7672d3'

# Login required decorator
def login_required(f):
    @wraps(f)  # Preserves the function name and docstring
    def wrap(*args, **kwargs):
        if 'user_id' not in session:
            return make_response(jsonify({'message': 'You need to log in first.'}), 401)
        return f(*args, **kwargs)
    return wrap

class Register(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            return make_response(jsonify({"message": "User already exists"}), 400)

        # Create new user
        new_user = User(username=username, email=email)
        new_user.password_hash = generate_password_hash(password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id  # Set session user_id

            return make_response(jsonify({"message": "User created successfully", "token": "your_token_here"}), 201)
        
        except IntegrityError as e:
            db.session.rollback()
            print(f"IntegrityError: {e}")
            return make_response(jsonify({'error': '422 Unprocessable Entity'}), 422)

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            return user.to_dict(), 200
        else:
            return make_response(jsonify({"error": "Unauthorized"}), 401)

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            return user.to_dict(), 200
        
        return make_response(jsonify({"message": "Invalid email or password"}), 401)

class ProfileResource(Resource):
    @login_required
    def get(self):
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        if user:
            return make_response(jsonify(user.to_dict()), 200)
        else:
            return {'error': 'User not found'}, 404

class Logout(Resource):
    @login_required
    def delete(self):
        session.pop('user_id', None)
        return make_response(jsonify({"message": "Logged out successfully"}), 204)

# BlogPost Resource
class BlogPostResource(Resource):
    @login_required
    def get(self, post_id=None):
        if post_id:
            post = BlogPost.query.get_or_404(post_id)
            return jsonify(post.to_dict())
        else:
            posts = BlogPost.query.all()
            return jsonify([post.to_dict() for post in posts])

    @login_required
    def post(self):
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        category_names = data.get('categories', [])

        if not title or not content:
            return make_response(jsonify({'message': 'Missing title or content'}), 400)

        user_id = session['user_id']
        user = User.query.get_or_404(user_id)

        post = BlogPost(title=title, content=content, author=user)

        for name in category_names:
            category = Category.query.filter_by(name=name).first()
            if not category:
                category = Category(name=name)
                db.session.add(category)
            post.categories.append(category)

        db.session.add(post)
        db.session.commit()
        return make_response(jsonify(post.to_dict()), 201)

    @login_required
    def put(self, post_id):
        post = BlogPost.query.get_or_404(post_id)
        user_id = session['user_id']
        if post.user_id != user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not the author of this post'}), 403)
        
        data = request.get_json()
        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)

        if 'categories' in data:
            post.categories.clear()
            for category_name in data['categories']:
                category = Category.query.filter_by(name=category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db.session.add(category)
                post.categories.append(category)

        db.session.commit()
        return jsonify(post.to_dict())

    @login_required
    def delete(self, post_id):
        post = BlogPost.query.get_or_404(post_id)
        user_id = session['user_id']
        if post.user_id != user_id:
            return make_response(jsonify({'message': 'Forbidden: You are not the author of this post'}), 403)

        db.session.delete(post)
        db.session.commit()
        return make_response(jsonify({'message': 'Blog post deleted successfully'}), 204)

# Comment Resource
class CommentResource(Resource):
    @login_required
    def get(self, post_id):
        comments = Comment.query.filter_by(post_id=post_id).all()
        return jsonify([comment.to_dict() for comment in comments])

    @login_required
    def post(self, post_id):
        post = BlogPost.query.get_or_404(post_id)
        data = request.get_json()
        content = data.get('content')
        if not content:
            return make_response(jsonify({'message': 'Missing content'}), 400)

        user_id = session['user_id']
        user = User.query.get_or_404(user_id)

        comment = Comment(content=content, post=post, author=user)
        db.session.add(comment)
        db.session.commit()

        return make_response(jsonify(comment.to_dict()), 201)

    @login_required
    def delete(self, comment_id):
        comment = Comment.query.get_or_404(comment_id)
        db.session.delete(comment)
        db.session.commit()
        return make_response(jsonify({'message': 'Comment deleted'}), 204)

# Category Resource
class CategoryResource(Resource):
    @login_required
    def get(self):
        categories = Category.query.all()
        return jsonify([category.to_dict() for category in categories])

    @login_required
    def post(self):
        data = request.get_json()
        name = data.get('name')
        if not name:
            return make_response(jsonify({'message': 'Missing name'}), 400)

        category = Category(name=name)
        db.session.add(category)
        db.session.commit()

        return jsonify(category.to_dict()), 201

# Adding resources to the API
api.add_resource(Register, '/register')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(ProfileResource, '/profile')
api.add_resource(BlogPostResource, '/posts', '/posts/<int:post_id>')
api.add_resource(CommentResource, '/posts/<int:post_id>/comments', '/comments/<int:comment_id>')
api.add_resource(CategoryResource, '/categories')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
