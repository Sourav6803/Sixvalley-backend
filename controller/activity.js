const express = require('express');
const router = express.Router();
const Activity = require('./models/Activity');
const User = require('../model/user');
const Product = require('../model/product');

router.post('/logActivity', async (req, res) => {
  const { userId, type, productId } = req.body;

  try {
    const activity = new Activity({ user: userId, type, product: productId });
    await activity.save();

    await User.findByIdAndUpdate(userId, { $push: { activity: activity._id } });

    res.status(200).send('Activity logged');
  } catch (error) {
    res.status(500).send('Error logging activity');
  }
});




const recommendProducts = async (userId) => {
    const user = await User.findById(userId).populate({
      path: 'activity',
      populate: { path: 'product' }
    });
  
    const productIds = user.activity.map(a => a.product._id);
    
    // Find products similar to the ones the user has interacted with
    const recommendations = await Product.find({ _id: { $nin: productIds } }).limit(10);
  
    return recommendations;
  };

// client
  const recommendBasedOnAttributes = async (userId) => {
    const user = await User.findById(userId).populate({
      path: 'activity',
      populate: { path: 'product' }
    });
  
    const lastViewedProduct = user.activity.slice(-1)[0].product;
  
    const recommendations = await Product.find({
      attributes: { $elemMatch: { key: lastViewedProduct.attributes.key, value: lastViewedProduct.attributes.value } }
    }).limit(10);
  
    return recommendations;
  };


  router.get('/recommendations/:userId', async (req, res) => {
    try {
      const recommendations = await recommendProducts(req.params.userId);
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(500).send('Error fetching recommendations');
    }
  });