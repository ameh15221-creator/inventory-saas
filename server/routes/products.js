// ======================================
// Products Routes
// Inventory SaaS
// ======================================

const express = require("express");
const router = express.Router();

const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");


// ======================================
// CLOUDINARY CONFIG
// ======================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// ======================================
// MULTER MEMORY STORAGE
// ======================================

const upload = multer({
    storage: multer.memoryStorage()
});


// ======================================
// CLOUDINARY UPLOAD FUNCTION
// ======================================

const uploadToCloudinary = (fileBuffer) => {

    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "inventory-saas/products",
                resource_type: "image"
            },

            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }
        );

        uploadStream.end(fileBuffer);

    });

};


// ======================================
// GET ALL PRODUCTS
// ======================================

router.get(
    "/",
    authMiddleware,
    async (req, res) => {

        try {

            const result = await pool.query(
                "SELECT * FROM products ORDER BY id DESC"
            );

            res.json({

                success: true,
                count: result.rows.length,
                data: result.rows

            });

        } catch (error) {

            console.error(
                "Get Products Error:",
                error.message
            );

            res.status(500).json({

                success: false,
                message: error.message

            });

        }

    }
);


// ======================================
// GET STOCK MOVEMENT HISTORY
// ======================================

router.get(
    "/stock-movements",
    authMiddleware,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT
                    sm.id,
                    sm.product_id,
                    p.name AS product_name,
                    sm.previous_quantity,
                    sm.new_quantity,
                    sm.quantity_change,
                    sm.movement_type,
                    sm.created_at
                FROM stock_movements sm
                LEFT JOIN products p
                    ON p.id = sm.product_id
                ORDER BY sm.created_at DESC, sm.id DESC
                `
            );

            res.json({

                success: true,
                count: result.rows.length,
                data: result.rows

            });

        } catch (error) {

            console.error(
                "Stock History Error:",
                error
            );

            res.status(500).json({

                success: false,
                message: error.message,
                detail: error.detail || null,
                code: error.code || null

            });

        }

    }
);


// ======================================
// GET SINGLE PRODUCT
// ======================================

router.get(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const result = await pool.query(
                "SELECT * FROM products WHERE id=$1",
                [req.params.id]
            );

            if (result.rows.length === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Product not found"

                });

            }

            res.json({

                success: true,
                data: result.rows[0]

            });

        } catch (error) {

            console.error(
                "Get Product Error:",
                error.message
            );

            res.status(500).json({

                success: false,
                message: error.message

            });

        }

    }
);


// ======================================
// CREATE PRODUCT
// ======================================

router.post(
    "/",
    authMiddleware,
    upload.single("image"),

    async (req, res) => {

        try {

            console.log("BODY:", req.body);
            console.log("FILE:", req.file);

            const {
                name,
                category_id,
                quantity,
                price,
                supplier
            } = req.body;


            // ======================================
            // UPLOAD IMAGE TO CLOUDINARY
            // ======================================

            let image = null;

            if (req.file) {

                const cloudinaryResult =
                    await uploadToCloudinary(
                        req.file.buffer
                    );

                image = cloudinaryResult.secure_url;

                console.log(
                    "Cloudinary Image URL:",
                    image
                );

            }


            // ======================================
            // INSERT PRODUCT
            // ======================================

            const result = await pool.query(

                `
                INSERT INTO products
                (
                    name,
                    category_id,
                    quantity,
                    price,
                    supplier,
                    image
                )

                VALUES($1,$2,$3,$4,$5,$6)

                RETURNING *
                `,

                [
                    name,
                    category_id,
                    quantity,
                    price,
                    supplier,
                    image
                ]

            );


            res.status(201).json({

                success: true,

                message:
                    "Product created successfully",

                data: result.rows[0]

            });

        } catch (error) {

            console.error(
                "Create Product Error:",
                error
            );

            res.status(500).json({

                success: false,
                message: error.message

            });

        }

    }
);


// ======================================
// UPDATE PRODUCT
// ======================================

router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),

    async (req, res) => {

        try {

            console.log(
                "UPDATE BODY:",
                req.body
            );

            console.log(
                "UPDATE FILE:",
                req.file
            );


            const {
                name,
                category_id,
                quantity,
                price,
                supplier
            } = req.body;


            // ======================================
            // GET EXISTING PRODUCT
            // ======================================

            const oldProduct = await pool.query(

                "SELECT * FROM products WHERE id=$1",

                [req.params.id]

            );


            if (oldProduct.rows.length === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Product not found"

                });

            }


            const existingProduct =
                oldProduct.rows[0];


            // ======================================
            // STOCK CALCULATION
            // ======================================

            const previousQuantity =
                Number(
                    existingProduct.quantity
                ) || 0;


            const newQuantity =
                Number(quantity) || 0;


            const quantityChange =
                newQuantity -
                previousQuantity;


            // ======================================
            // KEEP EXISTING IMAGE
            // ======================================

            let image =
                existingProduct.image;


            // ======================================
            // UPLOAD NEW IMAGE
            // ======================================

            if (req.file) {

                const cloudinaryResult =
                    await uploadToCloudinary(
                        req.file.buffer
                    );

                image =
                    cloudinaryResult.secure_url;


                console.log(
                    "New Cloudinary Image URL:",
                    image
                );

            }


            // ======================================
            // UPDATE PRODUCT
            // ======================================

            const result = await pool.query(

                `
                UPDATE products

                SET
                    name=$1,
                    category_id=$2,
                    quantity=$3,
                    price=$4,
                    supplier=$5,
                    image=$6

                WHERE id=$7

                RETURNING *
                `,

                [
                    name,
                    category_id,
                    newQuantity,
                    price,
                    supplier,
                    image,
                    req.params.id
                ]

            );


            // ======================================
            // RECORD STOCK MOVEMENT
            // ======================================

            if (quantityChange !== 0) {

                await pool.query(

                    `
                    INSERT INTO stock_movements
                    (
                        product_id,
                        previous_quantity,
                        new_quantity,
                        quantity_change,
                        movement_type
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
                    `,

                    [
                        req.params.id,
                        previousQuantity,
                        newQuantity,
                        quantityChange,

                        quantityChange > 0
                            ? "IN"
                            : "OUT"
                    ]

                );

            }


            // ======================================
            // RESPONSE
            // ======================================

            res.json({

                success: true,

                message:
                    "Product updated successfully",

                data: result.rows[0]

            });

        } catch (error) {

            console.error(
                "Update Product Error:",
                error
            );

            res.status(500).json({

                success: false,
                message: error.message

            });

        }

    }
);

// ======================================
// DELETE PRODUCT
// ======================================

router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const { id } = req.params;

            // Check if product exists
            const product = await pool.query(
                "SELECT * FROM products WHERE id=$1",
                [id]
            );

            if (product.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Delete product
            await pool.query(
                "DELETE FROM products WHERE id=$1",
                [id]
            );

            res.json({
                success: true,
                message: "Product deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete Product Error:",
                error
            );

            res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }
);

// ======================================
// EXPORT ROUTER
// ======================================

module.exports = router;
