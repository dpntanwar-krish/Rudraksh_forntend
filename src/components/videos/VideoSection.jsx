import React, { useEffect, useMemo, useState } from "react";
import { ActiveVideoProvider } from "../../hooks/ActiveVideoContext";
import { useVideos } from "../../hooks/useVideos";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";
import VideoGrid from "./VideoGrid";
import "./videos.css";

function VideoSectionInner({
  category = null,
  title = "Our Videos",
  subtitle = "Watch our latest work directly on the website.",
  showFilters = false,
  showSearch = false,
  showPagination = false,
  pageSize = 12,
}) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState(category || "All");
  const [page, setPage] = useState(1);

  const activeCategory = useMemo(() => {
    if (category) return category;
    return filterCategory === "All" ? null : filterCategory;
  }, [category, filterCategory]);

  const { videos, pagination, loading } = useVideos({
    category: activeCategory,
    search,
    page,
    limit: pageSize,
  });

  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, category]);

  return (
    <section className="yt-video-section reveal-on-scroll" aria-label={title}>
      <div className="yt-video-container">
        <div className="yt-section-head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {(showFilters || showSearch) && (
          <div className="yt-toolbar">
            {showSearch ? <SearchBar value={search} onChange={setSearch} /> : <div />}
            {showFilters ? (
              <CategoryFilter active={filterCategory} onChange={setFilterCategory} showAll />
            ) : null}
          </div>
        )}

        <VideoGrid
          videos={videos}
          loading={loading}
          emptyMessage={category ? `No videos in ${category} yet.` : "No videos found."}
        />

        {showPagination && pagination.totalPages > 1 ? (
          <div className="yt-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function VideoSection(props) {
  return (
    <ActiveVideoProvider>
      <VideoSectionInner {...props} />
    </ActiveVideoProvider>
  );
}
