const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler")
const { upload } = require("../app");
const cloudinary = require('cloudinary').v2
const fs = require('fs');
const path = require('path');
const axios = require("axios")


const MAX_RETRIES = 5; // Increase the maximum number of retries
const INITIAL_RETRY_DELAY = 1000;
const RETRY_DELAY = 1000; // Start with a 1-second delay

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.post("/importProducts", catchAsyncErrors(async (req, res) => {
  try {
    // Correct path to your JSON file

    const filePath = path.join(__dirname, '..', 'products.json'); // Update path accordingly
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    } // Update this path accordingly
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(jsonData);

    // Insert data into MongoDB
    await Product.insertMany(products);

    res.status(200).json({
      success: true,
      message: 'Products imported successfully',
    });
  } catch (error) {
    console.error('Error importing brands:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing products',
      error: error.message
    });
  }
}))


router.post("/uploadImages", upload.array("images", 10), catchAsyncErrors(async (req, res) => {
  const files = req.files;
  const uploadedImages = [];

  for (const file of files) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(file.buffer);
      });

      if (result && result.secure_url) {
        uploadedImages.push({ public_id: result.public_id, url: result.secure_url });
      } else {
        console.error("Image upload failed:", file.originalname);
      }
    } catch (error) {
      console.error(`Error uploading image: ${file.originalname}`, error);
    }
  }

  return res.json(uploadedImages);
}));



router.post("/create-product", upload.array("images", 10), catchAsyncErrors(async (req, res, next) => {
  try {
    const { shopId, originalPrice, discountType, discountAmount, variants, otherDetails, images } = req.body;

    const parsedVariants = variants ? JSON.parse(variants) : [];
    const parsedImages = images ? JSON.parse(images) : [];
    const parsedOtherDetails = otherDetails ? JSON.parse(otherDetails) : {};

    // Check if the shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return next(new ErrorHandler("Shop Id is invalid!", 400));
    }

    const variantsData = parsedVariants.map((variant) => ({
      ...variant,
      attributes: JSON.parse(variant.attributes), // Parse attributes back to an array of objects
      originalPrice: Number(variant.originalPrice),
      discountAmount: Number(variant.discountAmount),
      afterDiscountPrice: Number(variant.afterDiscountPrice),
      stock: Number(variant.stock),
      images: variant.images.map(image => ({
        public_id: image.public_id,
        url: image.url
      })),
    }));
 

    const originalPriceNum = Number(originalPrice);
    const discountAmountNum = Number(discountAmount);
    let afterDiscountPrice;

    if (discountType === "Flat") {
      afterDiscountPrice = originalPriceNum - discountAmountNum;
    } else {
      afterDiscountPrice = originalPriceNum - Math.ceil((discountAmountNum / 100) * originalPriceNum);
    }

    const productData = {
      ...req.body,
      shop: shop._id,
      variants: variantsData,
      afterDiscountPrice,
      otherDetails: parsedOtherDetails,
      images:  parsedImages,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "An error occurred", 500));
  }
}));


router.post('/generate-key-points', async (req, res) => {
  const { name, brand, mainCategory, subCategory } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Generate key points for a product with the following details:
  - Name: ${name}
  - Brand: ${brand}
  - Category: ${mainCategory}
  - SubCategory: ${subCategory}`;

  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
      prompt: prompt,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const keyPoints = response.data.choices[0].text.trim();
    res.json({ keyPoints });
  } catch (error) {
    console.error('Error generating bullet points:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate bullet points. Please try again later.' });
  }
});


router.post("/generate-summary", catchAsyncErrors(async (req, res) => {
  const { name, brand, mainCategory, subCategory } = req.body;
  const input_text = `Product Name: ${name}\nCategory: ${mainCategory}\nBrand: ${brand}\nDescription: ${subCategory}`;

  try {
    const response = await axios.post('https://api.deepai.org/api/summarization', {
      text: input_text
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': '9194dc85-64c7-40a8-9595-d7c321daca33' // Replace with your actual DeepAI API key
      }
    });

    const summary = response.data.output;
    res.json({ summary })

  } catch (error) {
    console.error('Error generating bullet points:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate bullet points. Please try again later.' });
  }
}))


router.post('/generate-bullet-points', async (req, res) => {
  const { name, productType, brand } = req.body;

  const prompt = `Generate bullet points for a product with the following details:
  - Product Name: ${name}
  - Product Type: ${productType}
  - Brand: ${brand}`;

  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant that generates bullet points for product descriptions." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const bulletPoints = response.data.choices[0].text.split('\n').filter(line => line.trim());
      res.json({ bulletPoints });
    } else {
      res.status(500).json({ error: 'Invalid response format from OpenAI' });
    }
  } catch (error) {
    console.error('Error generating bullet points:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate bullet points. Please try again later.' });
  }
});




router.get("/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get("/get-product/:name",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.findOne({ name: req.params.name });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get("/get-product-category/:category",
  catchAsyncErrors(async (req, res, next) => {
    try {

      const products = await Product.find({ category: req.params.category });
      const count = products.length


      res.status(201).json({
        success: true,
        total: count,
        products,

      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete product of a shop
router.delete("/delete-shop-product/:id", isSeller, catchAsyncErrors(async (req, res, next) => {
  try {

    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product is not found with this id", 404));
    }

    // Delete images from Cloudinary
    const deleteImagePromises = product.images.map(image =>
      cloudinary.uploader.destroy(image.public_id)
    );

    await Promise.all(deleteImagePromises);

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ success: true, message: "Product deleted successfully" });

  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
})
);

router.get("/getProductBySubCAtegory", catchAsyncErrors(async (req, res, next) => {
  try {
    const data = req.query


    if (Object.keys(data).length == 0) {
      const allProducts = await Product.find({})
      if (allProducts.length == 0) {
        return res.status(404).send({ status: false, message: "No products found" })
      }
      return res.status(200).send({ status: true, message: "products fetched successfully", data: allProducts })

    } else {
      let subCategory = req.query.subCategory
      let tags = req.query.tags
      let priceGreaterThan = req.query.priceGreaterThan
      let priceLessThan = req.query.priceLessThan


      let filter = {}

      if (subCategory != null) {
        //if (!/^[a-zA-Z0-9]{1,30}$/.test(name)) return res.status(400).send({ status: false, message: "name should contain only alphabets" })
        filter.subCategory = { $regex: subCategory, $options: "i" }

      }

      if (tags != null) {
        //if (!/^[a-zA-Z0-9]{1,30}$/.test(name)) return res.status(400).send({ status: false, message: "name should contain only alphabets" })
        filter.tags = { $regex: tags, $options: "i" }

      }

      if (priceGreaterThan != null) {
        if (!/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(priceGreaterThan)) return res.status(400).send({ status: false, message: "price filter should be a vaid number" })
        filter.price = { $gt: `${priceGreaterThan}` }
      }

      if (priceLessThan != null) {
        if (!/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(priceLessThan)) {
          return res.status(400).send({ status: false, message: "price filter should be a vaid number" })
        }
        filter.price = { $lt: `${priceLessThan}` }
      }


      //sorting
      if (req.query.priceSort != null) {
        if ((req.query.priceSort != 1 && req.query.priceSort != -1)) {
          return res.status(400).send({ status: false, message: 'use 1 for low to high and use -1 for high to low' })
        }
      }

      if (!priceGreaterThan && !priceLessThan) {
        const productList = await Product.find(filter).sort({ price: req.query.priceSort })
        if (productList.length == 0) {
          return res.status(404).send({ status: false, message: "No products available" })
        }
        return res.status(200).send({ status: true, message: "Products list", data: productList })
      }

      if (priceGreaterThan && priceLessThan) {
        const productList = await Product.find({
          $and: [filter, { price: { $gt: priceGreaterThan } }, {
            price: { $lt: priceLessThan }
          }]
        }).sort({ price: req.query.priceSort })
        if (productList.length == 0) {
          return res.status(404).send({ status: false, message: "No available products" })
        }
        return res.status(200).send({ status: true, message: "Products list", data: productList })
      }

      if (priceGreaterThan || priceLessThan) {
        const productList = await Product.find(filter).sort({ price: req.query.priceSort })
        if (productList.length == 0) {
          return res.status(404).send({ status: false, message: "No available products" })
        }
        return res.status(200).send({ status: true, message: "Products list", data: productList })
      }
    }
  }
  catch (err) {
    return next(new ErrorHandler(err, 400));
  }
}))

// get all products
router.get("/get-all-products", catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
})
);

router.get("/grtproduct/:id", catchAsyncErrors(async (req, res) => {
  const productId = req.params.id

  const findproduct = await Product.findById(productId)

  return res.send(findproduct)
}))

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const product = await Product.findById(productId);

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Reviwed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// all products --- for admin
router.get("/admin-all-products", isAuthenticated, isAdmin, catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });
    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
})
);

module.exports = router