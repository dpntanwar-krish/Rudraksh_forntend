import React, { useEffect, useState } from "react";
import axios from "axios";
import { server_url } from "../../url/url";
import "./Enquiry.css";

export default function Enquiry() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchEnquiries = async () => {
    setLoading(true);
    setStatusMsg("");

    try {
      const res = await axios.get(server_url + "/Enquiry/Eall");
      if (res?.data?.status === true) {
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.msg)
          ? res.data.msg
          : [];
        setRows(list);
      } else {
        setStatusMsg(String(res?.data?.msg || "Failed to load enquiries"));
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this enquiry?");
    if (!ok) return;

    try {
      const res = await axios.delete(server_url + "/Enquiry/Edelete/" + id);
      if (res?.data?.status === true) {
        setStatusMsg("Enquiry deleted");
        fetchEnquiries();
      } else {
        setStatusMsg(String(res?.data?.msg || "Delete failed"));
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to delete enquiry");
    }
  };

  return (
    <div className="enquiry-manager">
      <div className="enquiry-manager-head">
        <h2>Enquiry Manager</h2>
        <button type="button" className="refresh-btn" onClick={fetchEnquiries} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {statusMsg ? <p className="enquiry-status">{statusMsg}</p> : null}

      <div className="enquiry-table-wrap">
        <table className="enquiry-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.fullname || "-"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.phone || "-"}</td>
                  <td>{item.subject || "-"}</td>
                  <td className="message-cell">{item.message || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="delete-icon-btn"
                      onClick={() => handleDelete(item._id)}
                      aria-label="Delete enquiry"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <path
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
