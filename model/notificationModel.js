require("dotenv").config();
import mongoose, {Document, Model, Schema} from "mongoose";


const notificationSchema = new Schema<INotification>({
    title: {
        type: String,
        required: true
    },
    
    message:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        default: "unread"
    },
    userId: {
        type: String,
        required: true
    }
},{timestamps:true})

module.exports = mongoose.model("Notification", notificationSchema);

