import { useState } from "react";
import axios from "axios";
import { server_url } from "../url/url";
import "./Signup.css";

export default function Signup({ onSignupDone, onGoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      const { data } = await axios.post(`${server_url}/admin/signup`, payload);
      if (!data?.success) throw new Error(data?.message || "Signup failed.");
      setSuccess("Signup successful. Redirecting to login...");
      setTimeout(() => onSignupDone?.(), 700);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Admin Signup</h1>
        <p>Create a new admin account for Rudraksh Portal</p>

        <label htmlFor="name">Full Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={onChange} required />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          minLength={6}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={onChange}
          required
          minLength={6}
        />

        {error ? <div className="auth-error">{error}</div> : null}
        {success ? <div className="auth-success">{success}</div> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </button>

        <div className="auth-switch">
          Already have account?{" "}
          <button type="button" onClick={onGoLogin} className="link-btn">
            Go to login
          </button>
        </div>
      </form>
    </div>
  );
}
