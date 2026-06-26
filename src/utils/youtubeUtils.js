export const VIDEO_CATEGORIES = [
  "Photoshoot & Video",
  "Events",
  "Video Gallery",
];

export function validateYoutubeUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url.trim());
}

export function extractVideoId(url) {
  if (!url) return null;
  const value = url.trim();

  let match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  match = value.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  match = value.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
}

export function getThumbnailUrl(videoId, quality = "maxres") {
  if (!videoId) return "";
  const map = {
    maxres: "maxresdefault",
    high: "hqdefault",
    medium: "mqdefault",
    default: "default",
  };
  return `https://img.youtube.com/vi/${videoId}/${map[quality] || "maxresdefault"}.jpg`;
}

export function getEmbedUrl(videoId, autoplay = true) {
  if (!videoId) return "";
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function formatVideoDate(dateValue) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
