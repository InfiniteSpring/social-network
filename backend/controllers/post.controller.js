import {v2 as cloudinary} from 'cloudinary'
import mongoose from 'mongoose'

import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import Notification from '../models/notificataion.model.js'


export const createPost = async (req, res) => {
    try {
        const userId = req.user._id.toString() 
        const { title, text } = req.body
        let { image } = req.body

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if(!image && !text){
            return res.status(400).json({ message: 'Please provide either image or text' })
        }

        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            image = uploadResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            title,
            text,
            image
        })

        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        console.error('Error in createPost:', error.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const deletePost = async (req, res) => {
    const userId = req.user._id.toString()
    try {
        const { id } = req.params
        const post = await Post.findById(id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })
        
        if(post.user.toString() !== userId){
            return res.status(403).json({ message: 'You are not authorized to delete this post' })
        }

        if(post.image){
            await cloudinary.uploader.destroy(post.image.split('/').pop().split('.')[0])
        }

        await Post.deleteOne({ _id: id })
        res.status(200).json({ message: 'Post deleted successfully' })
    } catch (error) {
        console.error('Error in deletePost:', error.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })
        res.status(200).json(posts)
    } catch (error) {
        console.error('Error in getAllPosts:', error.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getPost = async (req, res) => {
    try {
        const { id } = req.params
        const post = await Post.findById(id).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })
        if (!post) return res.status(404).json({ message: 'Post not found' })

        res.status(200).json(post)
    } catch (error) {
        console.error('Error in getPost:', error.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const commentPost = async (req, res) => {
    const userId = req.user._id.toString()
    try {
        const { id } = req.params
        const post = await Post.findById(id)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        post.comments.push({
            user: userId,
            text: req.body.text
        })

        await post.save()
        res.status(201).json(post)
    } catch (error) {
        console.error('Error in commentPost:', error.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const likePost = async (req, res) => {
    const userId = req.user._id.toString();

    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (post.likes.includes(userId)) {
            user.likedPosts = user.likedPosts.filter(pid => pid.toString() !== post._id.toString());
            post.likes = post.likes.filter(uid => uid.toString() !== userId);
        } else {
            user.likedPosts.push(post._id);
            post.likes.push(userId);

            if (post.user.toString() !== userId) {
                const newNotification = new Notification({
                    from: userId,
                    to: post.user,
                    type: 'like'
                });
                await newNotification.save();
            }
        }

        await user.save();
        await post.save();

        const updatedPost = await Post.findById(id).populate('likes', 'username profileImage');

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error in likePost:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select('-password')
        if(!user) return res.status(404).json({ message: 'User not found' })
        
        const posts = await Post.find({ _id: {$in: user.likedPosts} }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })
        if(!posts) return res.status(404).json({ message: 'Post not found' })
        
        res.status(200).json(posts)
    } catch (error) {
        console.error('Error in getLikedPosts:', error.message)
        res.status(500).json({ message: 'Internal server error' })
    }
}
 
export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id.toString()
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const following = user.following;

        if (following.length === 0) {
            return res.status(200).json([]);
        }

        const followingPosts = await Post.find({ user: { $in: following } })
            .populate({ path: 'user', select: '-password' })
            .populate({ path: 'comments.user', select: '-password' });

        res.status(200).json(followingPosts);
    } catch (error) {
        console.error('Error in getFollowingPosts:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user: user._id })
            .populate({ path: 'user', select: '-password' })
            .populate({ path: 'comments.user', select: '-password' });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error in getUserPosts:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}