import { useState } from "react";
import "./Login.css";
import Register from "../Register";

function Login({ setUser }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!apiUrl) {
      setMessage("API URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <Register
        onRegistered={() => {
          setIsRegistering(false);
          setMessage("Registration successful! You can now sign in.");
        }}
      />
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Inventory SaaS</h1>

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
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {message && <p className="message">{message}</p>}
        </form>

        <button
  type="button"
  onClick={() => setIsRegistering(true)}
  style={{
    marginTop: "12px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  }}
>
  Create Account
</button>

      </div>
    </div>
  );
}

export default Login;