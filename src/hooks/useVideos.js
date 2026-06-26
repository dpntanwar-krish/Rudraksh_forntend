import { useCallback, useEffect, useState } from "react";
import { videoService } from "../services/videoService";

export function useVideos({
  category = null,
  search = "",
  page = 1,
  limit = 12,
  includeInactive = false,
  enabled = true,
} = {}) {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalVideos: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVideos = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        includeInactive: includeInactive ? "true" : undefined,
      };
      const res =
        category && !includeInactive
          ? await videoService.getByCategory(category, params)
          : await videoService.getAll({ ...params, category: category || undefined });

      if (res?.data?.success) {
        setVideos(Array.isArray(res.data.data) ? res.data.data : []);
        setPagination(res.data.pagination || { currentPage: page, totalPages: 1, totalVideos: 0 });
      } else {
        setVideos([]);
        setError(res?.data?.message || "Unable to load videos.");
      }
    } catch (err) {
      setVideos([]);
      setError(err?.response?.data?.message || "Unable to load videos.");
    } finally {
      setLoading(false);
    }
  }, [category, search, page, limit, includeInactive, enabled]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, pagination, loading, error, refetch: fetchVideos };
}
