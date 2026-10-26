import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Logo from "../assets/Logo-w.png";
import OfflineMap from "../components/map/OfflineMap";
import MapToolbar from "../components/map/MapToolbar";
import OfflineRegionDownloader from
  "../components/map/OfflineRegionDownloader";


const STORAGE_KEY = "resealience-map-features-v1";
const kindLabels = { ground: "Fishing ground", route: "Fishing route", hazard: "Hazard", incident: "Incident" };
const isEmbeddedPreview = new URLSearchParams(window.location.search).get("embed") === "preview";

function readSavedFeatures() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function Mappage() {
  const [features, setFeatures] = useState(() =>
    isEmbeddedPreview ? [] : readSavedFeatures()
  );
  const [activeTool, setActiveTool] = useState("pan");
  const [draftPoints, setDraftPoints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("Offline demo map · Local geographic data only");

  useEffect(() => {
    if (isEmbeddedPreview) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
    } catch {
      setMessage("Browser storage is unavailable. Export your data to keep a copy.");
    }
  }, [features]);

  const selectedFeature = useMemo(
    () => features.find((feature) => feature.id === selectedId) || null,
    [features, selectedId]
  );

  function handleMapPoint(point) {
    if (activeTool === "pan") return;
    if (activeTool === "ground" || activeTool === "route") {
      setDraftPoints((current) => [...current, point]);
      setMessage(`${draftPoints.length + 1} point(s) added. Finish when you're ready.`);
      return;
    }
    const kind = activeTool;
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : `feature-${Date.now()}`,
      kind,
      name: kind === "hazard" ? "Unlabelled hazard" : "Unlabelled incident",
      points: [point],
      createdAt: new Date().toISOString(),
    };
    setFeatures((current) => [...current, item]);
    setSelectedId(item.id);
    setMessage(`${kindLabels[kind]} added. Select it to edit its label or delete it.`);
    setActiveTool("pan");
  }

  function finishDrawing() {
    const minimum = activeTool === "ground" ? 3 : 2;
    if (draftPoints.length < minimum) {
      setMessage(`${activeTool === "ground" ? "A fishing ground needs at least 3 points." : "A route needs at least 2 points."}`);
      return;
    }
    const kind = activeTool;
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : `feature-${Date.now()}`,
      kind,
      name: kind === "ground" ? `Fishing ground ${features.filter(f => f.kind === "ground").length + 1}` : `Fishing route ${features.filter(f => f.kind === "route").length + 1}`,
      points: draftPoints,
      createdAt: new Date().toISOString(),
    };
    setFeatures((current) => [...current, item]);
    setSelectedId(item.id);
    setDraftPoints([]);
    setActiveTool("pan");
    setMessage(`${kindLabels[kind]} saved on this device.`);
  }

  function cancelDrawing() {
    setDraftPoints([]);
    setActiveTool("pan");
    setMessage("Drawing cancelled.");
  }

  function updateSelectedName(name) {
    setFeatures((current) => current.map((feature) => feature.id === selectedId ? { ...feature, name } : feature));
  }

  function deleteSelected() {
    if (!selectedId) return;
    setFeatures((current) => current.filter((feature) => feature.id !== selectedId));
    setSelectedId(null);
    setMessage("Selected feature deleted.");
  }

  async function exportGeoJSON() {
    const collection = {
      type: "FeatureCollection",
      features: features.map((item) => {
        let geometry;
        if (item.kind === "ground") {
          const ring = item.points.map(([lat, lng]) => [lng, lat]);
          if (ring.length) ring.push(ring[0]);
          geometry = { type: "Polygon", coordinates: [ring] };
        } else if (item.kind === "route") {
          geometry = { type: "LineString", coordinates: item.points.map(([lat, lng]) => [lng, lat]) };
        } else {
          const [lat, lng] = item.points[0];
          geometry = { type: "Point", coordinates: [lng, lat] };
        }
        return {
          type: "Feature",
          geometry,
          properties: { id: item.id, kind: item.kind, name: item.name, createdAt: item.createdAt },
        };
      }),
    };
    const json = JSON.stringify(collection, null, 2);
    const fileName = `resealience-observations-${new Date().toISOString().slice(0, 10)}.geojson`;

    if (Capacitor.isNativePlatform()) {
      try {
        const { uri } = await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: "reSEAlience observations",
          text: "Exported map observations (GeoJSON)",
          url: uri,
          dialogTitle: "Save or send your GeoJSON",
        });
        setMessage("GeoJSON exported. Choose where to save or send it.");
      } catch (error) {
        // Dismissing the share sheet also throws, so don't treat it as a failure
        if (!String(error?.message || error).toLowerCase().includes("cancel")) {
          setMessage("Export failed. Please try again.");
        }
      }
      return;
    }

    // Browser fallback
    const blob = new Blob([json], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    if (!window.confirm("Delete all locally saved map features? Export your data first if you need a backup.")) return;
    setFeatures([]);
    setSelectedId(null);
    setMessage("All local map features cleared.");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f7f7f2] text-slate-800">
      {!isEmbeddedPreview && (
        <header className="z-[1000] flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}>
              {sidebarOpen ? "←" : "☰"}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="reSEAlience" className="h-6 w-auto sm:h-7" />
                <p className="truncate text-sm font-extrabold tracking-tight text-[#16394a] sm:text-base">BakodDagat</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">● Offline basemap</span>
            <Link to="/" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Home</Link>
          </div>
        </header>
      )}

      <div className="flex min-h-0 flex-1">
        {!isEmbeddedPreview && sidebarOpen && (
          <aside className="z-[500] flex w-[min(21rem,88vw)] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-[#fffefa] p-4 sm:w-80">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Mapping workspace</p>
              <h1 className="mt-1 text-xl font-extrabold">Field observations</h1>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">Map fishing grounds, routes, and reported safety points. This prototype saves data only in this browser.</p>
            </div>

            
<MapToolbar
  activeTool={activeTool}
  onChange={(tool) => {
    setActiveTool(tool);
    setDraftPoints([]);
    setMessage(
      tool === "pan"
        ? "Explore the map."
        : `Selected ${kindLabels[tool] || tool}. Tap the map to add points.`
    );
  }}
  onFinish={finishDrawing}
  canFinish={
    draftPoints.length >=
    (activeTool === "ground" ? 3 : 2)
  }
  onCancel={cancelDrawing}
/>

{/* Offline map download controls */}
<div className="my-4">
  <OfflineRegionDownloader />
</div>

{/* Your existing Saved features section stays below */}
<div className="my-5 rounded-xl border border-slate-200 bg-white p-3">
  {/* Keep your existing saved features code here */}
</div>


            <div className="my-5 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Saved features</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold">{features.length}</span>
              </div>
              {features.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Nothing mapped yet. Choose a tool, then tap the map.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {features.map((feature) => (
                    <li key={feature.id}>
                      <button type="button" onClick={() => setSelectedId(feature.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left ${selectedId === feature.id ? "border-teal-700 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}>
                        <span className="block text-sm font-semibold">{feature.name}</span>
                        <span className="mt-0.5 block text-xs capitalize text-slate-500">{kindLabels[feature.kind]} · {feature.points.length} point(s)</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedFeature && (
              <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50/60 p-3">
                <h2 className="text-sm font-bold">Feature details</h2>
                <label className="mt-3 block text-xs font-semibold text-slate-600" htmlFor="feature-name">Label</label>
                <input id="feature-name" value={selectedFeature.name} onChange={(event) => updateSelectedName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" />
                <p className="mt-2 break-all text-xs text-slate-500">ID: {selectedFeature.id}</p>
                <button type="button" onClick={deleteSelected} className="mt-3 w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100">Delete selected feature</button>
              </div>
            )}

            <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
              <button type="button" onClick={exportGeoJSON} disabled={!features.length}
                className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40">Export GeoJSON</button>
              <button type="button" onClick={clearAll} disabled={!features.length}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Clear all local features</button>
              <p className="text-xs leading-relaxed text-slate-500">Data stays in this browser until cleared. Export regularly for backup.</p>
            </div>
          </aside>
        )}

        <main className="relative min-w-0 flex-1 bg-[#dcecf0]">
          <OfflineMap features={features} draftPoints={draftPoints} activeTool={activeTool}
            onMapPoint={handleMapPoint} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="pointer-events-none absolute left-3 top-3 z-[400] max-w-[calc(100%-1.5rem)] rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:left-5 sm:top-5">
            <p className="text-xs font-bold text-slate-800 sm:text-sm">Panay Island & Guimaras</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Schematic offline geography · not for navigation</p>
          </div>
          <div className="absolute bottom-4 left-3 right-3 z-[400] flex items-end justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
            <p role="status" className="max-w-[75%] rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm backdrop-blur">{message}</p>
            
          </div>
        </main>
      </div>
    </div>
  );
}
