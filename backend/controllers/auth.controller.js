import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js"


export const signup = async (req, res) => {
    try {
        const { username, password, fullname, email } = req.body;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

        const existingUser = await User.findOne({ username })
        if(existingUser){
            return res.status(400).json({ error: "Username is already taken" })
        }

        const existingEmail = await User.findOne({ email })
        if(existingEmail){
            return res.status(400).json({ error: "Email is already taken" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
            
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        }) 

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
            })
        } else {
            res.status(400).json({ error: "Invalid user data" })
        }

    } catch (error) {
        console.error({ success:false, message:error.message })
        res.status(500).json({ error: "Internal server error(((" })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username })
        if(!user){
            return res.status(400).json({ error: "User not found" })
        }
        
        const isPasswordCorrect = bcrypt.compare(password, user?.password || "")
        if(!isPasswordCorrect){
            return res.status(400).json({ error: "Incorrect password" })
        }

        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
        })
    } catch (error) {
        console.error({ success:false, message:error.message })
        res.status(500).json({ error: "Internal server error(((" })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt')
        res.status(200).json({ success: true, message: "Logged out successfully" }) 
    } catch (error) {
        console.error({ success:false, message:error.message })
        res.status(500).json({ error: "Internal server error(((" })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (error) {
        console.error({ success:false, message:error.message })
        res.status(500).json({ error: "Internal server error(((" })
    }
}