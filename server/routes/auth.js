const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const db = require("../config/db");


// ==========================
// REGISTER USER
// ==========================
router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;


    // Check if user exists
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );


    if (existingUser.rows.length > 0) {

      return res.status(400).json({
        success: false,
        message: "User already exists"
      });

    }


    // Encrypt password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );


    // Save user
    const newUser = await db.query(

      `INSERT INTO users
      (name, email, password)
      VALUES ($1,$2,$3)
      RETURNING id, name, email`,

      [
        name,
        email,
        hashedPassword
      ]

    );


    res.json({

      success: true,

      message: "User registered successfully",

      user: newUser.rows[0]

    });



  } catch (error) {


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server error"

    });


  }


});





// ==========================
// LOGIN USER
// ==========================
router.post("/login", async (req, res) => {


  try {


    const { email, password } = req.body;



    const result = await db.query(

      "SELECT * FROM users WHERE email=$1",

      [email]

    );



    if (result.rows.length === 0) {


      return res.status(400).json({

        success:false,

        message:"Invalid email or password"

      });


    }




    const user = result.rows[0];



    const passwordMatch = await bcrypt.compare(

      password,

      user.password

    );



    if (!passwordMatch) {


      return res.status(400).json({

        success:false,

        message:"Invalid email or password"

      });


    }





    const token = jwt.sign(

      {

        id:user.id,

        email:user.email

      },

      process.env.JWT_SECRET,

      {

        expiresIn:"1d"

      }

    );




    res.json({

      success:true,

      message:"Login successful",

      token,

      user:{

        id:user.id,

        name:user.name,

        email:user.email

      }


    });



  } catch(error) {


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server error"

    });


  }


});



module.exports = router;
