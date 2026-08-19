// ======================================
// PRODUCTS ROUTES
// Inventory SaaS
// ======================================

const express = require("express");
const router = express.Router();

const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const pool = require("../config/db");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");


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

        const uploadStream =
            cloudinary.uploader.upload_stream(
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
// CEO / MANAGER / CASHIER / STAFF
// ======================================

router.get(
    "/",
    authMiddleware,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT *
                FROM products
                ORDER BY id DESC
                `
            );

            return res.json({

                success: true,
                count: result.rows.length,
                data: result.rows

            });

        } catch (error) {

            console.error(
                "Get Products Error:",
                error.message
            );

            return res.status(500).json({

                success: false,
                message: error.message

            });
        }
    }
);


// ======================================
// GET STOCK MOVEMENT HISTORY
// ======================================
// CEO / MANAGER / CASHIER / STAFF
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

                ORDER BY
                    sm.created_at DESC,
                    sm.id DESC
                `
            );

            return res.json({

                success: true,
                count: result.rows.length,
                data: result.rows

            });

        } catch (error) {

            console.error(
                "Stock History Error:",
                error
            );

            return res.status(500).json({

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
// CEO / MANAGER / CASHIER / STAFF
// ======================================

router.get(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT *
                FROM products
                WHERE id = $1
                `,
                [req.params.id]
            );

            if (result.rows.length === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Product not found"

                });
            }

            return res.json({

                success: true,
                data: result.rows[0]

            });

        } catch (error) {

            console.error(
                "Get Product Error:",
                error.message
            );

            return res.status(500).json({

                success: false,
                message: error.message

            });
        }
    }
);


// ======================================
// CREATE PRODUCT
// ======================================
// CEO / MANAGER ONLY
// ======================================

router.post(
    "/",
    authMiddleware,
    allowRoles("CEO", "MANAGER"),
    upload.single("image"),

    async (req, res) => {

        try {

            console.log(
                "CREATE PRODUCT USER:",
                req.user
            );

            console.log(
                "BODY:",
                req.body
            );

            console.log(
                "FILE:",
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
            // VALIDATION
            // ======================================

            if (
                !name ||
                !category_id ||
                quantity === undefined ||
                price === undefined
            ) {

                return res.status(400).json({

                    success: false,
                    message:
                        "Name, category, quantity and price are required."

                });
            }


            // ======================================
            // UPLOAD IMAGE
            // ======================================

            let image = null;

            if (req.file) {

                const cloudinaryResult =
                    await uploadToCloudinary(
                        req.file.buffer
                    );

                image =
                    cloudinaryResult.secure_url;

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

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )

                RETURNING *
                `,

                [
                    name.trim(),
                    Number(category_id),
                    Number(quantity),
                    Number(price),
                    supplier || "",
                    image
                ]
            );


            // ======================================
            // RECORD INITIAL STOCK
            // ======================================

            const initialQuantity =
                Number(quantity);

            if (initialQuantity > 0) {

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
                        result.rows[0].id,
                        0,
                        initialQuantity,
                        initialQuantity,
                        "IN"
                    ]
                );
            }


            // ======================================
            // RESPONSE
            // ======================================

            return res.status(201).json({

                success: true,

                message:
                    "Product created successfully",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Create Product Error:",
                error
            );

            return res.status(500).json({

                success: false,
                message: error.message

            });
        }
    }
);


// ======================================
// UPDATE PRODUCT
// ======================================
// CEO / MANAGER ONLY
// ======================================

router.put(
    "/:id",
    authMiddleware,
    allowRoles("CEO", "MANAGER"),
    upload.single("image"),

    async (req, res) => {

        try {

            console.log(
                "UPDATE PRODUCT USER:",
                req.user
            );

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

            const oldProduct =
                await pool.query(

                    `
                    SELECT *
                    FROM products
                    WHERE id = $1
                    `,

                    [req.params.id]
                );


            if (
                oldProduct.rows.length === 0
            ) {

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

            const result =
                await pool.query(

                    `
                    UPDATE products

                    SET
                        name = $1,
                        category_id = $2,
                        quantity = $3,
                        price = $4,
                        supplier = $5,
                        image = $6

                    WHERE id = $7

                    RETURNING *
                    `,

                    [
                        name.trim(),
                        Number(category_id),
                        newQuantity,
                        Number(price),
                        supplier || "",
                        image,
                        req.params.id
                    ]
                );


            // ======================================
            // RECORD STOCK MOVEMENT
            // ======================================

            if (
                quantityChange !== 0
            ) {

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

            return res.json({

                success: true,

                message:
                    "Product updated successfully",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Update Product Error:",
                error
            );

            return res.status(500).json({

                success: false,
                message: error.message

            });
        }
    }
);


// ======================================
// DELETE PRODUCT
// ======================================
// CEO / MANAGER ONLY
// ======================================

router.delete(
    "/:id",
    authMiddleware,
    allowRoles("CEO", "MANAGER"),

    async (req, res) => {

        try {

            console.log(
                "DELETE PRODUCT USER:",
                req.user
            );


            const { id } =
                req.params;


            // ======================================
            // CHECK PRODUCT
            // ======================================

            const product =
                await pool.query(

                    `
                    SELECT *
                    FROM products
                    WHERE id = $1
                    `,

                    [id]
                );


            if (
                product.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,
                    message: "Product not found"

                });
            }


            // ======================================
            // DELETE PRODUCT
            // ======================================

            await pool.query(

                `
                DELETE FROM products
                WHERE id = $1
                `,

                [id]
            );


            // ======================================
            // RESPONSE
            // ======================================

            return res.json({

                success: true,

                message:
                    "Product deleted successfully"

            });

        } catch (error) {

            console.error(
                "Delete Product Error:",
                error
            );

            return res.status(500).json({

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

