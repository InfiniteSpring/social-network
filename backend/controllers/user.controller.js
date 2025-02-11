import bcrypt from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary'

import User from '../models/user.model.js'
import Notification from '../models/notificataion.model.js'
import { validatePassword } from '../lib/utils/validatePassword.js'

export const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.status(200).json(user)
    } catch (error) {
        console.error('Error in getUserProfile:', error)
        res.status(500).json({ message: 'Error getting user profile' })
    }
}

export const followUnfollowUser = async (req, res) => {
    const { id } = req.params
    try {
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if (id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot follow/unfollow yourself' })
        if (!userToModify) return res.status(404).json({ message: 'User not found' })

        const isFollowed = userToModify.followers.includes(currentUser._id)
        if(!isFollowed){
            userToModify.followers.push(currentUser._id)
            currentUser.following.push(userToModify._id)
            await userToModify.save()
            await currentUser.save()

            const newNotification = new Notification({
                from: currentUser._id,
                to: userToModify._id,
                type: 'follow'
            })

            await newNotification.save()

            res.status(200).json({ message: 'Followed user' })
        } else {
            userToModify.followers.remove(currentUser._id)
            currentUser.following.remove(userToModify._id)
            await userToModify.save()
            await currentUser.save()
            res.status(200).json({ message: 'Unfollowed user' })
        }
    } catch (error) {
        console.error('Error in followUnfollowUser:', error)
        res.status(500).json({ message: 'Error follow/unfollow user' })    
    }
}

export const getSuggestedUsers = async (req, res) => {
    const userId = req.user._id;
    try {

        const user = await User.findById(userId).select('-password');
        const following = user?.following || [];

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $nin: [...following, userId] }
                }
            },
            { $sample: { size: 10 } },
            {
                $project: {
                    password: 0
                }
            }
        ]);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getSuggestedUsers:', error.message);
        res.status(500).json({ message: 'Error getting suggested users' });
    }
}

export const updateUser = async (req, res) => {
    const { username, fullname, email, bio, 
        currentPassword, newPassword } = req.body;
    let { profileImage, coverImage } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId)

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({ message: 'Please provide current and new password' })
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({ message: 'Current password is incorrect' })
            }
            if(!validatePassword(newPassword)){
                return res.status(400).json({
                    success: false,
                    message: 'Password must have at least on uppercase letter, one lowercase letter, one number and one special character.(length more than 4)'
                })
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if(profileImage){
            if(user.profileImage){
                await cloudinary.uploader.destroy(user.profileImage.split('/').pop().split('.')[0])
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImage)
            profileImage = uploadResponse.secure_url
        }
        if(coverImage){
            if(user.coverImage){
                await cloudinary.uploader.destroy(user.coverImage.split('/').pop().split('.')[0])
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImage)
            coverImage = uploadResponse.secure_url
        }

        user.fullname = fullname || user.fullname
        user.email = email || user.email
        user.bio = bio || user.bio
        user.profileImage = profileImage || user.profileImage
        user.coverImage = coverImage || user.coverImage

        user = await user.save()

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json(userResponse)
    } catch (error) {
        console.error('Error in updateUser:', error.message);
        res.status(500).json({ message: 'Error updating user' });
    }
}