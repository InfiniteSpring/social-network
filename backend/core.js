import express from 'express'
import dotenv from 'dotenv'
import coockieParser from 'cookie-parser'

import connectMongoDB from './db/connection.js'
import authRouter from './routes/auth.routes.js'


dotenv.config()

const PORT = process.env.PORT

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(coockieParser())

app.use("/api/auth", authRouter)

 
app.listen(PORT, () => {
    console.log(`server is running on ${PORT} port`)
    connectMongoDB()
})