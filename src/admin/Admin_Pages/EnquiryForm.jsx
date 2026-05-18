import React, { useState } from "react";
import axios from "axios";
import { server_url } from "../../url/url";
import "./EnquiryForm.css";

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [statusMsg, setStatusMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyDigits = String(value || "").replace(/\D/g, "").slice(0, 10);
      setFormData((f) => ({ ...f, [name]: onlyDigits }));
      return;
    }
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const validate = (data) => {
    if (!data.fullname || data.fullname.trim().length < 3) return "Full name must be at least 3 characters";
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Enter a valid email";
    if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) return "Enter a valid 10 digit phone number";
    if (!data.subject || data.subject.trim().length < 5) return "Subject must be at least 5 characters";
    if (!data.message || data.message.trim().length < 10) return "Message must be at least 10 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate(formData);
    if (err) {
      setStatusMsg(err);
      return;
    }

    setSubmitting(true);
    setStatusMsg("Sending...");

    try {
      const res = await axios.post(server_url + "/Enquiry/Esave", formData);

      if (res?.data?.status === true) {
        setStatusMsg("Enquiry sent successfully");
        setFormData({ fullname: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatusMsg(String(res?.data?.msg || "Server error"));
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-enquiry-form-page">
      <div className="admin-enquiry-form-card">
        <h2>Enquiry Form</h2>
        <form onSubmit={handleSubmit} className="admin-enquiry-form">
          <div className="admin-enquiry-grid">
            <input type="text" name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="admin-enquiry-grid">
            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
          </div>

          <textarea name="message" placeholder="Message" rows={6} value={formData.message} onChange={handleChange} required />

          <button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send"}</button>
          <p className="admin-enquiry-status">{statusMsg}</p>
        </form>
      </div>
    </div>
  );
}
