import React, { memo } from "react";
import { VIDEO_CATEGORIES } from "../../utils/youtubeUtils";

function CategoryFilter({ active, onChange, showAll = false }) {
  const items = showAll ? ["All", ...VIDEO_CATEGORIES] : VIDEO_CATEGORIES;

  return (
    <div className="yt-category-filter" role="tablist" aria-label="Video categories">
      {items.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={active === cat}
          className={`yt-filter-btn ${active === cat ? "active" : ""}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default memo(CategoryFilter);
