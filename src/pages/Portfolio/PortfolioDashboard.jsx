import React, { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiBriefcase, FiMonitor, FiPrinter, FiVideo } from "../../components/Portfolio/PortfolioIcons";
import { getPortfolioCounts, PORTFOLIO_CATEGORIES } from "../../services/portfolioApi";
import LoadingSpinner from "../../components/Portfolio/LoadingSpinner";
import "./Portfolio.css";

const iconMap = {
  PRINTING: FiPrinter,
  OUTDOOR: FiBriefcase,
  ONLINE: FiMonitor,
  "PHOTOSHOOT & VIDEO": FiVideo,
};

export default function PortfolioDashboard({ onOpenCategory }) {
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPortfolioCounts()
      .then((response) => {
        if (!isMounted) return;
        const nextCounts = {};
        (response.data || []).forEach((row) => {
          nextCounts[row.category] = row.total;
        });
        setCounts(nextCounts);
      })
      .catch(() => setCounts({}))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = useMemo(() => Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0), [counts]);

  return (
    <div className="portfolio-page">
      <div className="portfolio-hero">
        <div>
          <p>Portfolio Management</p>
          <h2>Manage projects by service category</h2>
        </div>
        <div className="portfolio-total-card">
          <span>Total Projects</span>
          <strong>{totalProjects}</strong>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading portfolio categories..." />
      ) : (
        <div className="portfolio-category-grid">
          {PORTFOLIO_CATEGORIES.map((category) => {
            const Icon = iconMap[category] || FiBriefcase;
            return (
              <article className="portfolio-category-card" key={category}>
                <div className="portfolio-category-icon">
                  <Icon />
                </div>
                <h3>{category}</h3>
                <p>{counts[category] || 0} projects</p>
                <button type="button" onClick={() => onOpenCategory(category)}>
                  View <FiArrowRight />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
