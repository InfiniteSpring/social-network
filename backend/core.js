import express from 'express'
import dotenv from 'dotenv'
import coockieParser from 'cookie-parser'
import {v2 as cloudinary} from 'cloudinary'

import connectMongoDB from './db/connection.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'


dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const PORT = process.env.PORT

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(coockieParser())

app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/posts", postRouter)

 
app.listen(PORT, () => {
    console.log(`server is running on ${PORT} port`)
    connectMongoDB()
})