
import { OfflineMapManager } from "map-gl-offline";

export const STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";

export const offlineManager = new OfflineMapManager();

// Example test region around your existing map center.
// Replace these bounds with your actual target study area.
// Format: [[west longitude, south latitude],
//          [east longitude, north latitude]].
export const AVAILABLE_REGIONS = [
  {
    id: "region-six-test",
    name: "Region VI - Test Area",
    bounds: [
      [121.5, 10.5],
      [123.5, 12.0],
    ],
    minZoom: 5,
    maxZoom: 12,
  },
];
