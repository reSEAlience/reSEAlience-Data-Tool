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
const polygonTools = ["ground", "mangrove", "vegetation", "trash", "farm", "coral"];
const lineTools = ["route"];
const kindLabels = {
  ground: "Fishing ground",
  route: "Fishing route",
  hazard: "Hazard",
  incident: "Incident",
  mangrove: "Mangrove",
  vegetation: "Kelp",
  trash: "Trash",
  fish: "Fish sighting",
  farm: "Fish farm",
  coral: "Coral reef",
};

const isEmbeddedPreview = new URLSearchParams(window.location.search).get("embed") === "preview";

function readSavedFeatures() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function formatObservedMonth(value) {
  if (!value) return "Not recorded";
  const [year, month] = value.split("-").map(Number);
  if (!year || month < 1 || month > 12) return value;
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" })
    .format(new Date(year, month - 1, 1));
}

export default function Mappage() {
  const [features, setFeatures] = useState(() =>
    isEmbeddedPreview ? [] : readSavedFeatures()
  );
  const [activeTool, setActiveTool] = useState("pan");
  const [observedMonth, setObservedMonth] = useState("");
  const [fishSpecies, setFishSpecies] = useState("");
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

  if (!observedMonth) {
    setMessage(
      "Choose the observed month and year before adding an observation."
    );
    return;
  }

  // Polygon and line drawing
  if (
    polygonTools.includes(activeTool) ||
    lineTools.includes(activeTool)
  ) {
    setDraftPoints((current) => [...current, point]);

    setMessage(
      `${draftPoints.length + 1} point(s) added. Continue drawing or finish when ready.`
    );

    return;
  }

  // Fish sighting requires a species name
  if (activeTool === "fish" && !fishSpecies.trim()) {
    setMessage("Enter the fish species before marking its location.");
    return;
  }

  // Point-based features
  const kind = activeTool;

  const item = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `feature-${Date.now()}`,

    kind,
    name: kindLabels[kind],
    points: [point],

    fishSpecies: kind === "fish" ? fishSpecies.trim() : null,

    createdAt: new Date().toISOString(),
    observedMonth,
  };

  setFeatures((current) => [...current, item]);
  setSelectedId(item.id);

  setFishSpecies("");
  setActiveTool("pan");

  setMessage(`${kindLabels[kind]} added.`);
}

  function finishDrawing() {
  if (!observedMonth) {
    setMessage("Choose the observed month and year.");
    return;
  }

  const minimum = activeTool === "route" ? 2 : 3;

  if (draftPoints.length < minimum) {
    setMessage(
      activeTool === "route"
        ? "A route needs at least 2 points."
        : "An area needs at least 3 points."
    );
    return;
  }

  if (activeTool === "farm" && !fishSpecies.trim()) {
    setMessage("Enter the fish species present in this fish farm.");
    return;
  }

  const kind = activeTool;

  const item = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `feature-${Date.now()}`,

    kind,

    name: `${kindLabels[kind]} ${
      features.filter((f) => f.kind === kind).length + 1
    }`,

    points: draftPoints,

    fishSpecies:
      ["farm", "ground"].includes(kind) ? (fishSpecies.trim() || null) : null,

    createdAt: new Date().toISOString(),
    observedMonth,
  };

  setFeatures((current) => [...current, item]);
  setSelectedId(item.id);

  setDraftPoints([]);
  setFishSpecies("");
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

  function updateSelectedSpecies(value) {
    setFeatures((current) =>
      current.map((feature) =>
        feature.id === selectedId ? { ...feature, fishSpecies: value } : feature
      )
    );
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

        if (polygonTools.includes(item.kind)) {
          const ring = item.points.map(([lat, lng]) => [
            lng,
            lat,
          ]);

          if (ring.length) {
            ring.push(ring[0]);
          }

          geometry = {
            type: "Polygon",
            coordinates: [ring],
          };

        } else if (lineTools.includes(item.kind)) {

          geometry = {
            type: "LineString",
            coordinates: item.points.map(([lat, lng]) => [
              lng,
              lat,
            ]),
          };

        } else {

          const [lat, lng] = item.points[0];

          geometry = {
            type: "Point",
            coordinates: [lng, lat],
          };
        }

        return {
          type: "Feature",
          properties: {
            id: item.id,
            name: item.name,
            kind: item.kind,
            fishSpecies: item.fishSpecies,
            observedMonth: item.observedMonth,
            createdAt: item.createdAt,
          },
          geometry,
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
  observedMonth={observedMonth}
  onObservedMonthChange={setObservedMonth}
  fishSpecies={fishSpecies}
  onFishSpeciesChange={setFishSpecies}
  onChange={(tool) => {
    setActiveTool(tool);
    setDraftPoints([]);
    setFishSpecies("");
  }}
  onFinish={finishDrawing}
  canFinish={
    draftPoints.length >=
    (activeTool === "route" ? 2 : 3)
  }
  onCancel={cancelDrawing}
/>

{/* Offline map download controls */}
<div className="my-4">
  <OfflineRegionDownloader />
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
                        <span className="mt-0.5 block text-xs capitalize text-slate-500">{kindLabels[feature.kind] || feature.kind} · {feature.points.length} point(s)</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Observed: {formatObservedMonth(feature.observedMonth)}</span>
                        {feature.fishSpecies && (
                            <span className="mt-0.5 block text-xs text-slate-500">Species: {feature.fishSpecies}</span>
                          )}
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
               
                {["fish", "farm", "ground"].includes(selectedFeature.kind) && (
                  <>
                    <label className="mt-3 block text-xs font-semibold text-slate-600" htmlFor="feature-species">Fish species</label>
                    <input
                      id="feature-species"
                      value={selectedFeature.fishSpecies || ""}
                      onChange={(event) => updateSelectedSpecies(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    />
                  </>
                )}
                
                <input id="feature-name" value={selectedFeature.name} onChange={(event) => updateSelectedName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" />
                <p className="mt-2 text-xs text-slate-600">Observed: {formatObservedMonth(selectedFeature.observedMonth)}</p>
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
