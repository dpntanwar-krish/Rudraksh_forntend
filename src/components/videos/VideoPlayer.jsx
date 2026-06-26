import React, { memo } from "react";
import { getEmbedUrl } from "../../utils/youtubeUtils";

function VideoPlayer({ videoId, title = "YouTube video" }) {
  if (!videoId) return null;

  return (
    <div className="yt-video-player">
      <iframe
        src={getEmbedUrl(videoId, true)}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default memo(VideoPlayer);
