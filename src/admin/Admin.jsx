import React, { useEffect, useMemo, useState } from "react";
import "./Admin.css";
const rudrakshLogo = "/image/Rfavicon.png";
import File from "./File";
import Enquiry from "./Admin_Pages/Enquiry";
import SliderManager from "./SliderManager";
import SplashScreen from "../components/SplashScreen";
import YoutubeVideoManager from "./YoutubeVideoManager";
import NewsManager from "./NewsManager";
import PortfolioManager from "./PortfolioManager";
import TeamManager from "./TeamManager";
import AdminUserManager from "./AdminUserManager";
import axios from "axios";
import { server_url } from "../url/url";

const Admin = ({ onLogout, currentAdmin }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [activeView, setActiveView] = useState("dashboard");
	const [isLoading, setIsLoading] = useState(true);
	const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
	const [isYoutubeMenuOpen, setIsYoutubeMenuOpen] = useState(false);
	const [activePortfolioCat, setActivePortfolioCat] = useState("Printing");
	const [activeYoutubeCat, setActiveYoutubeCat] = useState("Photoshoot & Video");
	const adminEmail = currentAdmin?.email || "admin";
	const adminName = currentAdmin?.name || "Administrator";
	const adminInitial = adminName?.trim()?.charAt(0)?.toUpperCase() || "A";
	const [stats, setStats] = useState({
		sliders: 0,
		photos: 0,
		enquiries: 0,
		youtube: 0,
		portfolio: 0,
		team: 0,
	});

	const navItems = useMemo(
		() => [
			{ key: "dashboard", label: "Dashboard" },
			{ key: "enquiries", label: "Enquiry Manager" },
			{ key: "news", label: "News" },
			{ key: "banners", label: "Slider" },
			{ key: "images", label: "Photo Gallery" },
			{ key: "youtube", label: "YouTube Videos" },
			{ key: "portfolio", label: "Portfolio" },
			{ key: "team", label: "Team Members" },
			{ key: "password", label: "Admin Manager" },
		],
		[]
	);

	const portfolioCategories = [
		"Printing",
		"Outdoor",
		"Online",
		"Photoshoot & Video",
		"Events",
		"Promotional",
		"Electronic Ads"
	];

	const youtubeCategories = [
		"Photoshoot & Video",
		"Events",
		"Video Gallery",
	];

	const selectView = (key) => {
		setActiveView(key);
		setIsSidebarOpen(false);
	};

	const titleMap = {
		dashboard: "Dashboard",
		enquiries: "Enquiry Manager",
		news: "News Manager",
		banners: "Slider Manager",
		images: "Image Folder Manager",
		youtube: `${activeYoutubeCat} YouTube Manager`,
		portfolio: `${activePortfolioCat} Portfolio Manager`,
		team: "Team Member Manager",
		password: "Admin Manager",
	};

	const fetchDashboardStats = async () => {
		try {
			const [sliderRes, photoRes, enquiryRes, youtubeRes, newsRes, portfolioRes, teamRes] = await Promise.all([
				axios.get(server_url + "/Slider/all"),
				axios.get(server_url + "/File/files"),
				axios.get(server_url + "/Enquiry/Eall"),
				axios.get(server_url + "/api/videos", { params: { limit: 1, includeInactive: "true" } }),
				axios.get(server_url + "/News/all"),
				axios.get(server_url + "/Portfolio/count"),
				axios.get(server_url + "/Team/all"),
			]);

			const sliderCount = Array.isArray(sliderRes?.data?.data) ? sliderRes.data.data.length : 0;
			const photoCount = Array.isArray(photoRes?.data) ? photoRes.data.length : 0;
			const enquiryCount = Array.isArray(enquiryRes?.data?.data) ? enquiryRes.data.data.length : 0;
			const youtubeCount = Number(youtubeRes?.data?.pagination?.totalVideos || youtubeRes?.data?.data?.length || 0);
			const newsCount = Array.isArray(newsRes?.data?.data) ? newsRes.data.data.length : 0;
			const portfolioCount = Number(portfolioRes?.data?.count || 0);
			const teamCount = Array.isArray(teamRes?.data?.data) ? teamRes.data.data.length : 0;

			setStats({
				sliders: sliderCount,
				photos: photoCount,
				enquiries: enquiryCount,
				youtube: youtubeCount,
				news: newsCount,
				portfolio: portfolioCount,
				team: teamCount,
			});
		} catch (error) {
			console.error("Dashboard stats fetch failed:", error?.message || error);
		}
	};

	useEffect(() => {
		fetchDashboardStats();
	}, []);

	const analyticsItems = [
		{ label: "Slider", value: stats.sliders },
		{ label: "Photos", value: stats.photos },
		{ label: "YouTube", value: stats.youtube },
		{ label: "Enquiry", value: stats.enquiries },
		{ label: "News", value: stats.news },
		{ label: "Portfolio", value: stats.portfolio },
		{ label: "Team", value: stats.team },
	];
	const totalAnalyticsValue = analyticsItems.reduce((total, item) => total + (Number(item.value) || 0), 0);

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

				<nav className="sidebar-nav" id="adminSidebarNav" style={{ overflowY: "auto", overflowX: "hidden", flex: 1 }}>
					{navItems.map((item) => (
						<React.Fragment key={item.key}>
							<button
								className={`nav-link ${activeView === item.key ? "active" : ""}`}
								type="button"
								onClick={() => {
									if (item.key === "portfolio") {
										setIsPortfolioMenuOpen(!isPortfolioMenuOpen);
									} else if (item.key === "youtube") {
										setIsYoutubeMenuOpen(!isYoutubeMenuOpen);
									} else {
										selectView(item.key);
									}
								}}
							>
								{item.label}
								{item.key === "portfolio" && (
									<span style={{ marginLeft: "auto", transform: isPortfolioMenuOpen ? "rotate(90deg)" : "none", transition: "0.2s", fontSize: "10px" }}>▶</span>
								)}
								{item.key === "youtube" && (
									<span style={{ marginLeft: "auto", transform: isYoutubeMenuOpen ? "rotate(90deg)" : "none", transition: "0.2s", fontSize: "10px" }}>▶</span>
								)}
							</button>
							{item.key === "portfolio" && isPortfolioMenuOpen && (
								<div className="portfolio-submenu">
									{portfolioCategories.map((cat) => (
										<button
											key={cat}
											className={`nav-link portfolio-sub-link ${activeView === "portfolio" && activePortfolioCat === cat ? "active" : ""}`}
											onClick={() => {
												setActiveView("portfolio");
												setActivePortfolioCat(cat);
												setIsSidebarOpen(false);
											}}
										>
											{cat}
										</button>
									))}
								</div>
							)}
							{item.key === "youtube" && isYoutubeMenuOpen && (
								<div className="portfolio-submenu">
									{youtubeCategories.map((cat) => (
										<button
											key={cat}
											className={`nav-link portfolio-sub-link ${activeView === "youtube" && activeYoutubeCat === cat ? "active" : ""}`}
											onClick={() => {
												setActiveView("youtube");
												setActiveYoutubeCat(cat);
												setIsSidebarOpen(false);
											}}
										>
											{cat}
										</button>
									))}
								</div>
							)}
						</React.Fragment>
					))}
					<button className="nav-link logout-btn" type="button" onClick={onLogout}>
						Logout
					</button>
				</nav>

				<div className="sidebar-admin-meta">
					<strong>{adminName}</strong>
					<span>{adminEmail}</span>
				</div>

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
						<span className="dashboard-avatar">{adminInitial}</span>
						<div>
							<strong>{adminName}</strong>
							<p>{adminEmail}</p>
						</div>
					</div>
				</header>

				{activeView === "dashboard" ? (
					<section className="admin-section admin-dashboard">
						<div className="dashboard-metrics">
							<article className="dashboard-metric-card"><p>Slider Records</p><h3>{stats.sliders}</h3></article>
							<article className="dashboard-metric-card"><p>Total Photos</p><h3>{stats.photos}</h3></article>
							<article className="dashboard-metric-card"><p>YouTube Videos</p><h3>{stats.youtube}</h3></article>
							<article className="dashboard-metric-card"><p>Enquiry Queue</p><h3>{stats.enquiries}</h3></article>
							<article className="dashboard-metric-card"><p>News Records</p><h3>{stats.news}</h3></article>
							<article className="dashboard-metric-card"><p>Portfolio Records</p><h3>{stats.portfolio}</h3></article>
							<article className="dashboard-metric-card"><p>Team Members</p><h3>{stats.team}</h3></article>
						</div>

						<div className="dashboard-grid">
							<article className="dashboard-panel dashboard-analytics-panel">
								<div className="analytics-head">
									<div>
										<h3>Project Analytics</h3>
										<p>Percentage share across all admin records. Total equals 100%.</p>
									</div>
									<span className="analytics-total">Total: {totalAnalyticsValue}</span>
									<button type="button" onClick={fetchDashboardStats}>
										Refresh
									</button>
								</div>

								<div className="analytics-chart" aria-label="Project analytics chart">
									{analyticsItems.map((item) => {
										const value = Number(item.value) || 0;
										const percentage = totalAnalyticsValue > 0 ? (value / totalAnalyticsValue) * 100 : 0;
										const height = Math.max(percentage, value > 0 ? 8 : 2);
										return (
											<div className="analytics-bar-item" key={item.label}>
												<strong>{percentage.toFixed(1)}%</strong>
												<div className="analytics-bar-track">
													<span style={{ height: `${height}%` }} />
												</div>
												<p>{item.label}</p>
												<small>{value} records</small>
											</div>
										);
									})}
								</div>
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
        ) : activeView === "news" ? (
          <section className="admin-section">
            <NewsManager />
          </section>
        ) : activeView === "images" ? (
          <section className="admin-section">
            <File />
          </section>
        ) : activeView === "youtube" ? (
          <section className="admin-section">
            <YoutubeVideoManager category={activeYoutubeCat} />
          </section>
        ) : activeView === "portfolio" ? (
          <section className="admin-section">
            <PortfolioManager category={activePortfolioCat} />
          </section>
        ) : activeView === "team" ? (
          <section className="admin-section">
            <TeamManager />
          </section>
        ) : activeView === "password" ? (
          <section className="admin-section">
            <AdminUserManager currentAdmin={currentAdmin} />
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
