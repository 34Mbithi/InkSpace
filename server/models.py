from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

from datetime import datetime
from config import db, metadata

# Models go here!
#Association Table for Many to many Relationship between BlogPost and Category
post_category = db.Table(
    'post_category',
    metadata,
    db.Column('post_id', db.Integer, db.ForeignKey(
        'blog_posts.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey(
        'categories.id'), primary_key=True)
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_only = ('id', 'username', 'email')
    serialize_rules = ('-password',)

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

    #Relationship mapping user to posts
    posts = db.relationship('BlogPost', back_populates='author', cascade='all, delete-orphan')
    
    #Relationship mapping user to comments
    comments = db.relationship('Comment', back_populates='author', cascade='all, delete-orphan')

    def __repr__(self):
        return f' <User {self.username}, {self.email}>'
    
class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'
    
    serialize_only = ('id', 'name', 'posts.title', 'posts.content')
    serialize_rules = ()

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    #mapping category to BlogPosts:a category can have multiple posts
    posts = db.relationship('BlogPost', secondary=post_category, back_populates='categories')

    def __repr__(self):
        return f'<Category {self.name}>'
    
class BlogPost(db.Model, SerializerMixin):
    __tablename__ = 'blog_posts'
    
    serialize_only = ('id', 'title', 'content', 'created_at', 'categories.name', 'author.username')
    serialize_rules = ()

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    #Relationships
    #mapping a post to categories
    categories = db.relationship('Category', secondary=post_category, back_populates='posts')
    
    #mapping a post to an author
    author = db.relationship('User', back_populates='posts') 

    # mapping a post to comments
    comments = db.relationship('Comment', back_populates='post', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<BlogPost {self.title}, {self.content}>'
    
class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comments'

    serialize_only = ('id', 'content', 'created_at', 'post.title', 'author.username')
    serialize_rules = ()
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_posts.id'), nullable=False)

    #mapping a comment to a post
    post = db.relationship('BlogPost', back_populates='comments')

    #Mapping a comment to an author
    author = db.relationship('User', back_populates='comments')

    def __repr__(self):
        return f'<Comment {self.id}, {self.content}'
    
    



    

