import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapZoomEvents() {
  const map = useMap();
  useEffect(() => {
    const zoomIn = () => map.zoomIn();
    const zoomOut = () => map.zoomOut();
    window.addEventListener("resealience-zoom-in", zoomIn);
    window.addEventListener("resealience-zoom-out", zoomOut);
    return () => {
      window.removeEventListener("resealience-zoom-in", zoomIn);
      window.removeEventListener("resealience-zoom-out", zoomOut);
    };
  }, [map]);
  return null;
}
