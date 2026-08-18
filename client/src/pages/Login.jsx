import { useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://inventory-saas-c55p.onrender.com";

function Login({ setUser }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok || !data.success) {

        throw new Error(
          data.message ||
          "Invalid email or password"
        );

      }

      // ==========================
      // VERIFY USER DATA
      // ==========================

      console.log(
        "LOGGED IN USER:",
        data.user
      );

      console.log(
        "LOGGED IN ROLE:",
        data.user?.role
      );

      // ==========================
      // SAVE TOKEN
      // ==========================

      localStorage.setItem(
        "token",
        data.token
      );

      // ==========================
      // SAVE COMPLETE USER
      // ==========================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ==========================
      // UPDATE APP USER
      // ==========================

      setUser(data.user);

      toast.success(
        `Welcome ${data.user?.name || "User"}!`
      );

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      toast.error(
        error.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-icon">
          📦
        </div>

        <h1>
          Inventory SaaS
        </h1>

        <p>
          Supermarket Management System
        </p>


        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "🔐 Login"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default Login;