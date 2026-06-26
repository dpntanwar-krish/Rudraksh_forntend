import React from 'react';

export default function PortfolioDashboard() {
  return (
    <div className="admin-dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome to the admin dashboard. Here you can find an overview of your portfolio.</p>
      {/* Add dashboard content here */}
      <div className="dashboard-metrics">
        <div className="dashboard-metric-card">
          <p>Total Projects</p>
          <h3>15</h3>
        </div>
        <div className="dashboard-metric-card">
          <p>Active Users</p>
          <h3>5</h3>
        </div>
        <div className="dashboard-metric-card">
          <p>New Enquiries</p>
          <h3>3</h3>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h3>Recent Activities</h3>
          <p>Activity logs will be displayed here.</p>
        </div>
        <div className="dashboard-panel">
          <h3>Quick Stats</h3>
          <p>More detailed statistics.</p>
        </div>
      </div>
    </div>
  );
}