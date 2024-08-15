const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { public_id: String, url:String },
    notificationCount: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PushNotification', pushNotificationSchema);