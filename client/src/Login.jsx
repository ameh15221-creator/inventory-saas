import { useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5001"
).replace(/\/$/, "");

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("🔥 LOGIN BUTTON CLICKED");
    console.log("📧 EMAIL:", email);
    console.log("🔗 LOGIN URL:", `${API_URL}/api/auth/login`);

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

      console.log("🔥 RESPONSE STATUS:", res.status);

      const data = await res.json();

      console.log("🔥 LOGIN RESPONSE:", data);

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      console.log("✅ LOGIN SUCCESS");
      console.log("👤 USER:", data.user);

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);

      toast.success(
        `Welcome ${data.user?.name || "User"}!`
      );

    } catch (error) {
      console.error(
        "❌ LOGIN ERROR:",
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

            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
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
