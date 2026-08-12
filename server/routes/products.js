// ======================================
// Products Routes
// Inventory SaaS
// ======================================

const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");


// ======================================
// CREATE UPLOAD FOLDER AUTOMATICALLY
// ======================================

const uploadFolder = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}


// ======================================
// MULTER STORAGE
// ======================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadFolder);

    },


    filename: function (req, file, cb) {

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});


const upload = multer({
    storage: storage
});



// ======================================
// GET ALL PRODUCTS
// ======================================

router.get("/", authMiddleware, async (req, res)=>{

    try {

        const result = await pool.query(
            "SELECT * FROM products ORDER BY id DESC"
        );


        res.json({

            success:true,
            count:result.rows.length,
            data:result.rows

        });


    } catch(error){

        console.error(error.message);

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

});



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

router.get("/:id", authMiddleware, async(req,res)=>{

    try {

        const result = await pool.query(
            "SELECT * FROM products WHERE id=$1",
            [req.params.id]
        );


        if(result.rows.length===0){

            return res.status(404).json({

                success:false,
                message:"Product not found"

            });

        }


        res.json({

            success:true,
            data:result.rows[0]

        });


    }catch(error){

        console.error(error.message);

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

});




// ======================================
// CREATE PRODUCT
// ======================================

router.post(
"/",
authMiddleware,
upload.single("image"),
async(req,res)=>{


try{


console.log("BODY:",req.body);
console.log("FILE:",req.file);


const {
name,
category_id,
quantity,
price,
supplier

}=req.body;



const image = req.file
? req.file.filename
: null;



const result = await pool.query(

`
INSERT INTO products
(name,category_id,quantity,price,supplier,image)

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

success:true,
message:"Product created successfully",
data:result.rows[0]

});



}catch(error){


console.error(
"Create Product Error:",
error.message
);


res.status(500).json({

success:false,
message:error.message

});


}


});




// ======================================
// UPDATE PRODUCT
// ======================================

router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    async (req, res) => {
        try {
            console.log("UPDATE BODY:", req.body);
            console.log("UPDATE FILE:", req.file);

            const {
                name,
                category_id,
                quantity,
                price,
                supplier
            } = req.body;

            // Get the existing product
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

            const existingProduct = oldProduct.rows[0];

            const previousQuantity =
                Number(existingProduct.quantity) || 0;

            const newQuantity =
                Number(quantity) || 0;

            const quantityChange =
                newQuantity - previousQuantity;

            let image = existingProduct.image;

            // Keep existing image unless a new one is uploaded
            if (req.file) {
                image = req.file.filename;
            }

            // Update product
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

            // Record stock movement only when quantity changed
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
                    VALUES ($1, $2, $3, $4, $5)
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

            res.json({
                success: true,
                message: "Product updated successfully",
                data: result.rows[0]
            });

        } catch (error) {
            console.error(
                "Update Product Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);




module.exports = router;