import React, { memo, useState } from "react";
import { useActiveVideo } from "../../hooks/ActiveVideoContext";
import { formatVideoDate, getThumbnailUrl } from "../../utils/youtubeUtils";
import VideoPlayer from "./VideoPlayer";

function VideoCard({ video }) {
  const { isActive, playVideo } = useActiveVideo();
  const [thumbSrc, setThumbSrc] = useState(video.thumbnail || getThumbnailUrl(video.videoId));
  const playing = isActive(video._id);

  const handlePlay = () => {
    playVideo(video._id);
  };

  const handleThumbError = () => {
    setThumbSrc(getThumbnailUrl(video.videoId, "high"));
  };

  return (
    <article className={`yt-video-card ${playing ? "is-playing" : ""}`}>
      <div className="yt-video-media">
        {playing ? (
          <VideoPlayer videoId={video.videoId} title={video.title} />
        ) : (
          <button type="button" className="yt-video-thumb-btn" onClick={handlePlay} aria-label={`Play ${video.title}`}>
            <img
              src={thumbSrc}
              alt={video.title}
              className="yt-video-thumb"
              loading="lazy"
              onError={handleThumbError}
            />
            <span className="yt-play-overlay" aria-hidden="true">
              <span className="yt-play-icon" />
            </span>
          </button>
        )}
      </div>
      <div className="yt-video-body">
        <span className="yt-category-badge">{video.category}</span>
        <h3 className="yt-video-title">{video.title}</h3>
        <time className="yt-video-date" dateTime={video.createdAt}>
          {formatVideoDate(video.createdAt)}
        </time>
      </div>
    </article>
  );
}

export default memo(VideoCard);
