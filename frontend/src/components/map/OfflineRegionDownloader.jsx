
import { useState } from "react";
import {
  offlineManager,
  STYLE_URL,
  AVAILABLE_REGIONS,
} from "../../lib/OfflineMapManager";

export default function OfflineRegionDownloader() {
  const [regionId, setRegionId] = useState(
    AVAILABLE_REGIONS[0].id
  );
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);

  async function downloadRegion() {
    const region = AVAILABLE_REGIONS.find(
      (item) => item.id === regionId
    );

    if (!region || downloading) return;

    setDownloading(true);
    setProgress(0);
    setStatus("Preparing download...");

    try {
      await offlineManager.downloadRegion(
        {
          ...region,
          styleUrl: STYLE_URL,
        },
        {
          onProgress: ({
            phase,
            percentage,
            message,
          }) => {
            setProgress(
              Math.max(0, Math.min(100, percentage || 0))
            );

            setStatus(
              `${phase || "Downloading"}${
                message ? `: ${message}` : ""
              }`
            );
          },
        }
      );

      setProgress(100);
      setStatus(
        `${region.name} is downloaded. Test it with your device offline.`
      );
    } catch (error) {
      console.error("Offline download failed:", error);
      setStatus(
        `Download failed: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setDownloading(false);
    }
  }

  async function listDownloadedRegions() {
    try {
      const regions =
        await offlineManager.listStoredRegions();

      setStatus(
        regions.length
          ? `Saved regions: ${regions
              .map((region) => region.name || region.id)
              .join(", ")}`
          : "No offline regions found."
      );
    } catch (error) {
      setStatus(
        `Could not read saved regions: ${error.message}`
      );
    }
  }

  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <h2 className="text-lg font-semibold">
        Offline Maps
      </h2>

      <label
        htmlFor="offline-region"
        className="block text-sm font-medium"
      >
        Select a region
      </label>

      <select
        id="offline-region"
        value={regionId}
        onChange={(event) =>
          setRegionId(event.target.value)
        }
        disabled={downloading}
        className="w-full rounded border p-2"
      >
        {AVAILABLE_REGIONS.map((region) => (
          <option key={region.id} value={region.id}>
            {region.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={downloadRegion}
        disabled={downloading}
        className="w-full rounded bg-teal-700 p-2 text-white disabled:opacity-50"
      >
        {downloading
          ? "Downloading map..."
          : "Download for Offline Use"}
      </button>

      {downloading && (
        <progress
          className="w-full"
          value={progress}
          max={100}
        />
      )}

      <p className="text-sm" aria-live="polite">
        {status}
      </p>

      <button
        type="button"
        onClick={listDownloadedRegions}
        disabled={downloading}
        className="rounded border px-3 py-2 text-sm"
      >
        Check Saved Regions
      </button>
    </section>
  );
}