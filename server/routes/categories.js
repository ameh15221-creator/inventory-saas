// ======================================
// Categories Routes
// Inventory SaaS
// ======================================

const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ======================================
// GET ALL CATEGORIES
// ======================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM categories ORDER BY id DESC"
        );

        res.json({

            success: true,
            count: result.rows.length,
            data: result.rows

        });

    } catch (error) {

        console.error("Category Error:", error.message);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

});


// ======================================
// CREATE CATEGORY
// ======================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const { name } = req.body;

        const result = await pool.query(

            `
            INSERT INTO categories(name)
            VALUES($1)
            RETURNING *
            `,

            [name]

        );

        res.status(201).json({

            success: true,
            message: "Category created successfully",
            data: result.rows[0]

        });

    } catch (error) {

        console.error("Create Category Error:", error.message);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

});


// ======================================
// UPDATE CATEGORY
// ======================================

router.put("/:id", authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;
        const { name } = req.body;

        const result = await pool.query(

            `
            UPDATE categories
            SET name = $1
            WHERE id = $2
            RETURNING *
            `,

            [
                name,
                id
            ]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Category not found"

            });

        }

        res.json({

            success: true,
            message: "Category updated successfully",
            data: result.rows[0]

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

});


// ======================================
// DELETE CATEGORY
// ======================================

router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(

            "DELETE FROM categories WHERE id = $1 RETURNING *",

            [id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Category not found"

            });

        }

        res.json({

            success: true,
            message: "Category deleted successfully",
            data: result.rows[0]

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

});

module.exports = router;