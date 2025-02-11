import express from 'express'
import protectRoute from '../middleware/protectRoute.js'
import { createPost, deletePost, getAllPosts, commentPost, likePost, 
    getPost, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js'

const router = express.Router()

router.post('/create', protectRoute, createPost)
router.get('/following', protectRoute, getFollowingPosts)
router.delete('/delete/:id', protectRoute, deletePost)
router.get('/liked/:id', protectRoute, getLikedPosts)
router.get('/user/:username', protectRoute, getUserPosts)
router.get('/all', getAllPosts)
router.post('/:id/comment', protectRoute, commentPost)  
router.post('/:id/like', protectRoute, likePost)
router.get('/:id', getPost)


export default router