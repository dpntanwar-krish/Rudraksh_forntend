import React, { memo } from "react";

function SearchBar({ value, onChange, placeholder = "Search videos by title..." }) {
  return (
    <div className="yt-search-bar">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search videos"
      />
    </div>
  );
}

export default memo(SearchBar);
