import React, { useMemo, useState } from "react";
import "./Admin.css";
import rudrakshLogo from "/public/image/Rfavicon.png";
import File from "./File";
import Enquiry from "./Admin_Pages/Enquiry";
import SliderManager from "./SliderManager";
import SplashScreen from "../components/SplashScreen";

const Admin = ({ onLogout }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [activeView, setActiveView] = useState("dashboard");
	const [isLoading, setIsLoading] = useState(true);

	const navItems = useMemo(
		() => [
			{ key: "dashboard", label: "Dashboard" },
			{ key: "enquiries", label: "Enquiry Manager" },
			{ key: "portfolio", label: "Portfolio" },
			{ key: "news", label: "News" },
			{ key: "banners", label: "Slider" },
			{ key: "images", label: "Photo Gallery" },
			{ key: "videos", label: "Video Gallery" },
			{ key: "password", label: "Password" },
		],
		[]
	);

	const selectView = (key) => {
		setActiveView(key);
		setIsSidebarOpen(false);
	};

	const titleMap = {
		dashboard: "Dashboard",
		enquiries: "Enquiry Manager",
		portfolio: "Portfolio Manager",
		news: "News Manager",
		banners: "Slider Manager",
		images: "Image Folder Manager",
		videos: "Video Folder Manager",
		password: "Password Reset",
	};

	return (
		<>
			{isLoading ? <SplashScreen duration={3000} onComplete={() => setIsLoading(false)} /> : null}
			<div className="admin-layout-root">
			<aside className={`admin-sidebar ${isSidebarOpen ? "is-open" : ""}`} id="adminSidebar">
				<div className="sidebar-header">
					<div className="brand">
						<div className="brand-logo">
							<img src={rudrakshLogo} alt="Rudraksh Logo" />
						</div>
						<div>
							<h4>Rudraksh Creation </h4>
							<span>Admin Portal</span>
						</div>
					</div>
					<button
						className="sidebar-menu-toggle"
						type="button"
						onClick={() => setIsSidebarOpen((v) => !v)}
						aria-label="Toggle admin menu"
					>
						<span></span>
						<span></span>
						<span></span>
					</button>
				</div>

				<nav className="sidebar-nav" id="adminSidebarNav">
					{navItems.map((item) => (
						<button
							key={item.key}
							className={`nav-link ${activeView === item.key ? "active" : ""}`}
							type="button"
							onClick={() => selectView(item.key)}
						>
							{item.label}
						</button>
					))}
					<button className="nav-link logout-btn" type="button" onClick={onLogout}>
						Logout
					</button>
				</nav>

				<div className="sidebar-footer">
					<div className="support-card">
						<h6>Need Help?</h6>
						<p>Manage banners, gallery, and enquiry leads.</p>
					</div>
				</div>
			</aside>

			{isSidebarOpen ? (
				<button className="sidebar-overlay" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu" />
			) : null}

			<main className="admin-content">
				<header className="dashboard-topbar">
					<div className="topbar-left">
						<button
							className="topbar-menu-btn"
							type="button"
							onClick={() => setIsSidebarOpen(true)}
							aria-label="Open admin menu"
						>
							<span></span>
							<span></span>
							<span></span>
						</button>
						<h1>{titleMap[activeView]}</h1>
					</div>
					<div className="dashboard-user-chip">
						<span className="dashboard-avatar">A</span>
						<div>
							<strong>krishtanwar153@gmail.com</strong>
							<p>Administrator</p>
						</div>
					</div>
				</header>

				{activeView === "dashboard" ? (
					<section className="admin-section admin-dashboard">
						<div className="dashboard-metrics">
							<article className="dashboard-metric-card"><p>Slider Records</p><h3>0</h3></article>
							<article className="dashboard-metric-card"><p>Total Photos</p><h3>0</h3></article>
							<article className="dashboard-metric-card"><p>Total Videos</p><h3>0</h3></article>
							<article className="dashboard-metric-card"><p>Enquiry Queue</p><h3>0</h3></article>
							<article className="dashboard-metric-card"><p>News Records</p><h3>0</h3></article>
						</div>

						<div className="dashboard-grid">
							<article className="dashboard-panel">
								<h3>Project Analytics</h3>
								<p>Graphs and analytics widgets can be attached here.</p>
							</article>
							<article className="dashboard-panel">
								<h3>Portfolio Analytics</h3>
								<p>Category-wise file counts can be shown here.</p>
							</article>
						</div>
					</section>
        ) : activeView === "enquiries" ? (
          <section className="admin-section">
            <Enquiry />
          </section>
        ) : activeView === "banners" ? (
          <section className="admin-section">
            <SliderManager />
          </section>
        ) : activeView === "images" ? (
          <section className="admin-section">
            <File />
          </section>
        ) : (
          <section className="admin-section"></section>
        )}
			</main>
			</div>
		</>
	);
};

export default Admin;
