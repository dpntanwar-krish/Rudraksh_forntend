import { useState } from "react";
import axios from "axios";
import { server_url } from "../url/url";
import "./Login.css";

export default function Login({ onLoginSuccess, onGoSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${server_url}/admin/login`, form);
      if (!data?.success) throw new Error(data?.message || "Login failed.");
      onLoginSuccess?.({ token: data.token, admin: data.admin });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Admin Login</h1>
        <p>Sign in to access Rudraksh Admin Portal</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />

        {error ? <div className="auth-error">{error}</div> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="auth-switch">
          New admin?{" "}
          <button type="button" onClick={onGoSignup} className="link-btn">
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
