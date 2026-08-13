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
        console.error("Category Error:", error);

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

        console.log("CREATE CATEGORY BODY:", req.body);

        const name =
            typeof req.body.name === "string"
                ? req.body.name.trim()
                : "";

        const description =
            typeof req.body.description === "string"
                ? req.body.description.trim()
                : null;


        // ======================================
        // VALIDATE CATEGORY NAME
        // ======================================

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }


        // ======================================
        // CHECK DUPLICATE CATEGORY
        // ======================================

        const existingCategory = await pool.query(
            `
            SELECT id
            FROM categories
            WHERE LOWER(name) = LOWER($1)
            `,
            [name]
        );

        if (existingCategory.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }


        // ======================================
        // CREATE CATEGORY
        // ======================================

        const result = await pool.query(
            `
            INSERT INTO categories
            (
                name,
                description
            )
            VALUES
            (
                $1,
                $2
            )
            RETURNING *
            `,
            [
                name,
                description
            ]
        );


        console.log(
            "CATEGORY CREATED:",
            result.rows[0]
        );


        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Category Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
            detail: error.detail || null,
            code: error.code || null
        });
    }
});


// ======================================
// UPDATE CATEGORY
// ======================================

router.put("/:id", authMiddleware, async (req, res) => {
    try {

        const { id } = req.params;

        const name =
            typeof req.body.name === "string"
                ? req.body.name.trim()
                : "";

        const description =
            typeof req.body.description === "string"
                ? req.body.description.trim()
                : null;


        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }


        const result = await pool.query(
            `
            UPDATE categories
            SET
                name = $1,
                description = $2
            WHERE id = $3
            RETURNING *
            `,
            [
                name,
                description,
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

        console.error(
            "Update Category Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
            detail: error.detail || null,
            code: error.code || null
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
            `
            DELETE FROM categories
            WHERE id = $1
            RETURNING *
            `,
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

        console.error(
            "Delete Category Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
            detail: error.detail || null,
            code: error.code || null
        });
    }
});


module.exports = router;