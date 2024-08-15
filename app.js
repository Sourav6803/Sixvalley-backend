const express = require('express');
const ErrorHandler = require('./middleware/error');
const app = express()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const cors = require("cors")
const multer = require("multer")
const cloudinary = require('cloudinary').v2


if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
        path: "backend/config/.env"
    })
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
})

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'https://sixvalley-frontend.vercel.app',
    credentials: true
}))

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))
app.use("/test", (req, res) => {
    res.send("Hello world!");
});

const storage = multer.memoryStorage();
exports.upload = multer({ storage });



// Global error handler to catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

// import routes

const user = require("./controller/user");
const shop = require('./controller/shop');
const product = require('./controller/product');
const event = require('./controller/event');
const cupon = require('./controller/couponCode');
const payment = require('./controller/payment');
const order = require('./controller/order');
const conversation = require('./controller/conversation');
const message = require('./controller/message');
const sendToken = require('./utils/jwtToken');
const admin = require("./controller/admin")
const category = require("./controller/category")
const subCategory = require("./controller/subCategory")
const subSubCategory =  require("./controller/subSubCategory")
const brand = require("./controller/brand")
const attribute = require("./controller/attribute")
const banner = require("./controller/banner")
const flashDeal = require("./controller/flahDeal")
const dealsOfTheDay = require("./controller/dealofTheDayController")
const featureDeal = require("./controller/featureDeal")


app.use("/api/v2/user", user)
app.use("/api/v2/shop", shop)
app.use("/api/v2/product", product)
app.use("/api/v2/event", event)
app.use("/api/v2/cupon", cupon)
app.use("/api/v2/payment", payment);
app.use("/api/v2/order", order);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/admin", admin)
app.use("/api/v2/category", category)
app.use("/api/v2/subCategory", subCategory)
app.use("/api/v2/subSubCategory", subSubCategory)
app.use("/api/v2/brand", brand)
app.use("/api/v2/attribute", attribute)
app.use("/api/v2/banner", banner)
app.use("/api/v2/flashDeal", flashDeal)
app.use("/api/v2/dealsOfTheDay", dealsOfTheDay)
app.use("/api/v2/featureDeal", featureDeal)



// It's for error handeling
app.use(ErrorHandler)

module.exports = app



