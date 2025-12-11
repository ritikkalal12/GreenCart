import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imagesUrl });

    res.json({ success: true, message: 'Product Added' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product : /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get single Product : /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: 'Stock Updated' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Product : /api/product/update
export const updateProduct = async (req, res) => {
  try {
    // If multipart: productData will be JSON string in req.body.productData (from client FormData), else fields in req.body
    let body = req.body;
    if (req.body.productData) {
      try {
        body = JSON.parse(req.body.productData);
      } catch (e) {
        // ignore parse error and keep req.body
      }
    }

    const {
      id,
      name,
      category,
      offerPrice,
      price,
      description,
      inStock,
      image,
    } = body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: 'Missing product id' });

    const update = {};
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (offerPrice !== undefined) update.offerPrice = offerPrice;
    if (price !== undefined) update.price = price;
    if (description !== undefined) update.description = description;
    if (inStock !== undefined) update.inStock = inStock;
    // handle uploaded files (req.files) similar to addProduct
    if (req.files && req.files.length > 0) {
      const images = req.files;
      const imagesUrl = await Promise.all(
        images.map(async (item) => {
          // file available at item.path or item.buffer depending on multer config
          const path = item.path || item.buffer;
          const uploadRes = await cloudinary.uploader.upload(item.path, {
            folder: 'greencart',
          });
          return uploadRes.secure_url;
        })
      );
      update.image = imagesUrl;
    } else if (image !== undefined) {
      // if client sent an image array (URLs), use them
      update.image = image;
    }

    await Product.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete Product : /api/product/delete
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: 'Missing product id' });

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
