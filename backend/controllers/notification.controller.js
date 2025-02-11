import Notification from "../models/notificataion.model.js"

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const notifications = await Notification.find({to:userId}).populate({
            path: 'from',
            select: 'username profileImage'
        })

        await Notification.updateMany({to:userId}, {read:true})

        res.status(200).json(notifications)
    } catch (error) {
        console.log("Error in getNotifications", error)
        res.status(500).json(error)
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        await Notification.deleteMany({to:userId})
        res.status(200).json({message:"Notifications deleted successfully"})
    } catch (error) {
        console.log("Error in deleteNotifications", error)
        res.status(500).json(error)
    }
}