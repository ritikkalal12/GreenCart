import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

const uploadImages = async (files) => {
  return Promise.all(
    files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
      return result.secure_url;
    })
  );
};

// Add Product
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData || "{}");

    if (!productData.name || !productData.price) {
      return res.status(400).json({ success: false, message: "Missing required product fields" });
    }

    const imagesUrl = req.files?.length ? await uploadImages(req.files) : [];

    const newProduct = await Product.create({ ...productData, image: imagesUrl });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
