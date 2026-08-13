import { useState } from "react";
import "./Login.css";

function Login({ setUser }) {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("Logging in...");

    try {

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );


      const data = await response.json();


      if (response.ok && data.success) {

        localStorage.setItem(
          "token",
          data.token
        );


        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );


        setUser(data.user);


        setMessage("Login successful!");

      } else {

        setMessage(
          data.message || "Invalid email or password"
        );

      }


    } catch (error) {

      console.error("Login error:", error);

      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );

    }

  };


  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          Inventory SaaS
        </h1>


        <p className="subtitle">
          Manage your business inventory easily
        </p>


        <form onSubmit={handleSubmit}>


          <input

            type="email"

            name="email"

            placeholder="Email address"

            value={formData.email}

            onChange={handleChange}

            required

          />


          <input

            type="password"

            name="password"

            placeholder="Password"

            value={formData.password}

            onChange={handleChange}

            required

          />


          <button type="submit">
            Sign In
          </button>


          <p className="message">
            {message}
          </p>


        </form>


      </div>


    </div>

  );

}

export default Login;
