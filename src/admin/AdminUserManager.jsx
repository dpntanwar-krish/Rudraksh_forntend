import { useEffect, useMemo, useState } from "react";
import axios from "axios";
// import { server_url } from "../url/url";
const  server_url= require("dotenv");
server_url.config();
import "./AdminUserManager.css";

const emptyForm = {
  id: "",
  name: "",
  email: "",
  role: "admin",
  password: "",
};

export default function AdminUserManager({ currentAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(form.id);

  const currentAdminId = useMemo(() => String(currentAdmin?.id || ""), [currentAdmin]);

  const loadAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${server_url}/admin/users`, { withCredentials: true });
      if (!data?.success) throw new Error(data?.message || "Unable to load admin users.");
      setAdmins(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load admin users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const editAdmin = (admin) => {
    setForm({
      id: admin.id,
      name: admin.name || "",
      email: admin.email || "",
      role: admin.role || "admin",
      password: "",
    });
    setError("");
    setMessage("");
  };

  const saveAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim() || "admin",
    };

    if (!isEditing || form.password) payload.password = form.password;

    try {
      const request = isEditing
        ? axios.put(`${server_url}/admin/users/${form.id}`, payload, { withCredentials: true })
        : axios.post(`${server_url}/admin/users`, payload, { withCredentials: true });

      const { data } = await request;
      if (!data?.success) throw new Error(data?.message || "Unable to save admin user.");
      setMessage(data.message || "Admin user saved.");
      setForm(emptyForm);
      await loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to save admin user.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async (admin) => {
    const confirmed = window.confirm(`Delete admin user "${admin.email}"?`);
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      const { data } = await axios.delete(`${server_url}/admin/users/${admin.id}`, { withCredentials: true });
      if (!data?.success) throw new Error(data?.message || "Unable to delete admin user.");
      setMessage(data.message || "Admin user deleted.");
      if (form.id === admin.id) setForm(emptyForm);
      await loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to delete admin user.");
    }
  };

  return (
    <div className="admin-user-manager">
      <form className="admin-user-form" onSubmit={saveAdmin}>
        <div className="admin-user-form-head">
          <div>
            <h2>{isEditing ? "Edit Admin User" : "Add Admin User"}</h2>
            <p>User ID uses the login email. Passwords are stored securely in MongoDB.</p>
          </div>
          {isEditing ? (
            <button type="button" className="admin-user-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="admin-user-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={updateField} required />
          </label>
          <label>
            Admin User ID
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Role
            <input name="role" value={form.role} onChange={updateField} required />
          </label>
          <label>
            {isEditing ? "New Password" : "Password"}
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required={!isEditing}
              minLength={6}
              placeholder={isEditing ? "Leave blank to keep current password" : ""}
            />
          </label>
        </div>

        {message ? <div className="admin-user-message">{message}</div> : null}
        {error ? <div className="admin-user-error">{error}</div> : null}

        <button type="submit" className="admin-user-save" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Admin" : "Add Admin"}
        </button>
      </form>

      <div className="admin-user-list">
        <div className="admin-user-list-head">
          <h3>All Admin Users</h3>
          <button type="button" className="admin-user-secondary" onClick={loadAdmins} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="admin-user-table-wrap">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>User ID</th>
                <th>Password</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="admin-user-empty">
                    {loading ? "Loading admin users..." : "No admin users found."}
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isSelf = String(admin.id) === currentAdminId;
                  return (
                    <tr key={admin.id}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.hasPassword ? "Protected - change only" : "Not set"}</td>
                      <td>{admin.role}</td>
                      <td>
                        <div className="admin-user-actions">
                          <button type="button" onClick={() => editAdmin(admin)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteAdmin(admin)}
                            disabled={isSelf}
                            title={isSelf ? "You cannot delete the active account" : "Delete admin user"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
