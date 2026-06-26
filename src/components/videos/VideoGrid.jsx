import React, { memo } from "react";
import VideoCard from "./VideoCard";

function VideoGridSkeleton({ count = 6 }) {
  return (
    <div className="yt-video-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="yt-skeleton-card" aria-hidden="true">
          <div className="yt-skeleton-media" />
          <div className="yt-skeleton-line" />
          <div className="yt-skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

function VideoGrid({ videos, loading, emptyMessage = "No videos found." }) {
  if (loading) return <VideoGridSkeleton />;

  if (!videos.length) {
    return <div className="yt-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="yt-video-grid">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}

export default memo(VideoGrid);
