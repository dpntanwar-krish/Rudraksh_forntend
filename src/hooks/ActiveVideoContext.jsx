import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ActiveVideoContext = createContext(null);

export function ActiveVideoProvider({ children }) {
  const [activeId, setActiveId] = useState(null);

  const playVideo = useCallback((id) => {
    setActiveId(id);
  }, []);

  const stopVideo = useCallback(() => {
    setActiveId(null);
  }, []);

  const value = useMemo(
    () => ({ activeId, playVideo, stopVideo, isActive: (id) => activeId === id }),
    [activeId, playVideo, stopVideo],
  );

  return <ActiveVideoContext.Provider value={value}>{children}</ActiveVideoContext.Provider>;
}

export function useActiveVideo() {
  const ctx = useContext(ActiveVideoContext);
  if (!ctx) throw new Error("useActiveVideo must be used within ActiveVideoProvider");
  return ctx;
}
