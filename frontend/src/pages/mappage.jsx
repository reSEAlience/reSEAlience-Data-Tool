import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import Logo from "../assets/Logo-w.png";
import OfflineMap from "../components/map/OfflineMap";
import OfflineRegionDownloader from "../components/map/OfflineRegionDownloader";
import FGMappingPanel from "../components/map/FGMappingPanel";
import DAMappingPanel from "../components/map/DAMappingPanel";
import ControlNumberModal from "../components/modals/ControlNumberModal";
import FishingTimeModal from "../components/modals/FishingTimeModal";
import HazardSelectModal from "../components/modals/HazardSelectModal";
import ReviewModal from "../components/modals/ReviewModal";

// Wizard steps (matches the flowchart):
// control (p2) -> time (p3) -> fg (p4, loops per time of day) -> hazards (p5) -> da (p6) -> review (p7)
// "preview" is used when the page is embedded in the homepage: no modal, no sidebar.
const LINE_KINDS = ["route"];

const isEmbeddedPreview =
  new URLSearchParams(window.location.search).get("embed") === "preview";

// The map only knows the old tool names, so point placement reuses "hazard"
// as its tap-to-place tool. Drawing a route uses "route"; "pan" is plain exploring.
const mapToolFor = (tool) => (tool === "fgpoint" ? "hazard" : tool);

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `feature-${Date.now()}-${Math.random()}`);

export default function Mappage() {
  const [step, setStep] = useState(isEmbeddedPreview ? "preview" : "control");
  const [session, setSession] = useState({ controlNumber: "", mapFG: false, mapDA: false });
  const [timesOfDay, setTimesOfDay] = useState([]);
  const [timeIndex, setTimeIndex] = useState(0);
  const [hazards, setHazards] = useState([]);
  const [activeHazard, setActiveHazard] = useState(null);

  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState("pan"); // pan | fgpoint | route | hazard
  const [draftPoints, setDraftPoints] = useState([]);
  const [days, setDays] = useState([]);
  const [months, setMonths] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("Offline demo map · Local geographic data only");

  const currentTime = timesOfDay[timeIndex];
  const selectedFeature = useMemo(() => features.find((f) => f.id === selectedId) || null, [features, selectedId]);

  // Remarks belong to a specific point or route. A selected route resolves to its point.
  const selectedPoint =
    selectedFeature?.kind === "fgpoint"
      ? selectedFeature
      : selectedFeature?.kind === "route"
      ? features.find((f) => f.id === selectedFeature.linkedPointId) || null
      : null;
  const selectedRoute = selectedPoint
    ? features.find((f) => f.kind === "route" && f.linkedPointId === selectedPoint.id) || null
    : null;

  const hazardPoints = useMemo(() => features.filter((f) => f.kind === "hazard"), [features]);
  const hazardCounts = useMemo(() => {
    const counts = {};
    hazardPoints.forEach((f) => { counts[f.hazardType] = (counts[f.hazardType] || 0) + 1; });
    return counts;
  }, [hazardPoints]);

  const toggle = (setter) => (value) =>
    setter((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));

  function resetTool() {
    setActiveTool("pan");
    setDraftPoints([]);
  }

  /* ---------- Wizard navigation ---------- */

  function submitControl(data) {
    setSession(data);
    setStep(data.mapFG ? "time" : "hazards");
  }

  function submitTimes(times) {
    setTimesOfDay(times);
    setTimeIndex(0);
    setDays([]);
    setMonths([]);
    resetTool();
    setStep("fg");
    setMessage(`Mapping fishing points for: ${times[0]}`);
  }

  function proceedFG() {
    const hasPoint = features.some((f) => f.kind === "fgpoint" && f.timeOfDay === currentTime);
    if (!hasPoint) return setMessage(`Add at least one fishing point for "${currentTime}" first.`);

    resetTool();
    setSelectedId(null);

    // "all times in day covered?" NO -> next time of day
    if (timeIndex < timesOfDay.length - 1) {
      setTimeIndex(timeIndex + 1);
      setDays([]);
      setMonths([]);
      setMessage(`Now mapping: ${timesOfDay[timeIndex + 1]}`);
      return;
    }
    // YES -> "FG only?" YES -> review, NO -> hazard question
    setStep(session.mapDA ? "hazards" : "review");
  }

  function submitHazards(list) {
    setHazards(list);
    setActiveHazard(list[0]);
    resetTool();
    setActiveTool("hazard");
    setStep("da");
    setMessage(`Tap the map to add a point for: ${list[0]}`);
  }

  function proceedDA() {
    resetTool();
    setStep("review");
  }

  function goBack(from) {
    resetTool();
    if (from === "time") setStep("control");
    if (from === "hazards") setStep(session.mapFG ? "fg" : "control");
    if (from === "review") setStep(session.mapDA ? "da" : "fg");
  }

  function restart() {
    setStep("control");
    setSession({ controlNumber: "", mapFG: false, mapDA: false });
    setTimesOfDay([]);
    setTimeIndex(0);
    setHazards([]);
    setActiveHazard(null);
    setFeatures([]);
    setSelectedId(null);
    setDays([]);
    setMonths([]);
    resetTool();
    setMessage("Started a new entry.");
  }

  /* ---------- Map interaction ---------- */

  function handleMapPoint(point) {
    if (activeTool === "pan") return;

    // FG: drawing a route to the selected point
    if (step === "fg" && activeTool === "route") {
      setDraftPoints((cur) => [...cur, point]);
      setMessage(`${draftPoints.length + 1} route point(s). Tap Finish Route when done.`);
      return;
    }

    // FG: placing a fishing point
    if (step === "fg" && activeTool === "fgpoint") {
      if (!days.length || !months.length) {
        return setMessage("Choose at least one day and one month for this point first.");
      }
      const count = features.filter((f) => f.kind === "fgpoint").length + 1;
      const item = {
        id: newId(),
        kind: "fgpoint",
        name: `Fishing point ${count}`,
        points: [point],
        timeOfDay: currentTime,
        days,
        months,
        remarks: null,
        createdAt: new Date().toISOString(),
      };
      setFeatures((cur) => [...cur, item]);
      setSelectedId(item.id);
      setActiveTool("pan");
      setMessage(`${item.name} added. Draw a route to it, or add another point.`);
      return;
    }

    // DA: placing a hazard point
    if (step === "da" && activeTool === "hazard") {
      if (!activeHazard) return setMessage("Choose a hazard first.");
      const item = {
        id: newId(),
        kind: "hazard",
        name: activeHazard,
        hazardType: activeHazard,
        points: [point],
        remarks: null,
        createdAt: new Date().toISOString(),
      };
      setFeatures((cur) => [...cur, item]);
      setSelectedId(item.id);
      setMessage(`${activeHazard} point added.`);
    }
  }

  /* ---------- FG panel actions ---------- */

  const selectedIsPoint = selectedFeature?.kind === "fgpoint";

  function startAddPoint() {
    if (!days.length || !months.length) return setMessage("Choose at least one day and one month first.");
    setActiveTool("fgpoint");
    setDraftPoints([]);
    setMessage("Tap the map to place the fishing point.");
  }

  function startRoute() {
    if (!selectedIsPoint) return setMessage("Select a fishing point first.");
    setActiveTool("route");
    setDraftPoints([]);
    setMessage(`Tap the map to trace the route to ${selectedFeature.name}.`);
  }

  function finishRoute() {
    if (draftPoints.length < 1) return setMessage("Tap at least one point for the route.");
    const item = {
      id: newId(),
      kind: "route",
      name: `Route to ${selectedFeature.name}`,
      // end the route exactly at the fishing point
      points: [...draftPoints, selectedFeature.points[0]],
      timeOfDay: selectedFeature.timeOfDay,
      linkedPointId: selectedFeature.id,
      remarks: null,
      createdAt: new Date().toISOString(),
    };
    setFeatures((cur) => [...cur, item]);
    resetTool();
    setMessage("Route saved.");
  }

  function cancelRoute() {
    resetTool();
    setMessage("Route cancelled.");
  }

  function deleteRoute() {
    const pointId = selectedIsPoint ? selectedId : selectedFeature?.linkedPointId;
    if (!pointId) return;
    setFeatures((cur) => cur.filter((f) => !(f.kind === "route" && f.linkedPointId === pointId)));
    setMessage("Route deleted.");
  }

  function removePoint() {
    if (!selectedFeature) return;
    const id = selectedFeature.id;
    setFeatures((cur) => cur.filter((f) => f.id !== id && f.linkedPointId !== id));
    setSelectedId(null);
    setMessage("Point removed.");
  }

  /* ---------- DA panel actions ---------- */

  function selectHazard(h) {
    setActiveHazard(h);
    setActiveTool("hazard");
    setMessage(`Tap the map to add a point for: ${h}`);
  }

  function selectHazardPoint(point) {
    setSelectedId(point.id);
    setActiveHazard(point.hazardType);
  }

  function updateRemark(id, value) {
    setFeatures((cur) => cur.map((f) => (f.id === id ? { ...f, remarks: value } : f)));
  }

  function removeFeatureById(id) {
    setFeatures((cur) => cur.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
    setMessage("Point removed.");
  }

  /* ---------- Export ---------- */

  async function exportGeoJSON() {
    const collection = {
      type: "FeatureCollection",
      features: features.map((item) => {
        const coords = item.points.map(([lat, lng]) => [lng, lat]);
        const geometry = LINE_KINDS.includes(item.kind)
          ? { type: "LineString", coordinates: coords }
          : { type: "Point", coordinates: coords[0] };

        return {
          type: "Feature",
          properties: {
            id: item.id,
            controlNumber: session.controlNumber,
            name: item.name,
            kind: item.kind,
            timeOfDay: item.timeOfDay ?? null,
            days: item.days?.join(", ") ?? null,
            months: item.months?.join(", ") ?? null,
            hazardType: item.hazardType ?? null,
            linkedPointId: item.linkedPointId ?? null,
            remarks: item.remarks?.trim() || null,
            createdAt: item.createdAt,
          },
          geometry,
        };
      }),
    };

    const json = JSON.stringify(collection, null, 2);
    const safeControl = session.controlNumber.replace(/[^\w-]+/g, "_");
    const fileName = `bakoddagat-${safeControl}-${new Date().toISOString().slice(0, 10)}.geojson`;

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

    const blob = new Blob([json], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- Render ---------- */

  const inMapping = step === "fg" || step === "da";
  const showSidebar = !isEmbeddedPreview && sidebarOpen && inMapping;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f7f7f2] text-slate-800">
      {!isEmbeddedPreview && (
        <header className="z-[1000] flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {inMapping && (
              <button type="button" onClick={() => setSidebarOpen((o) => !o)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}>
                {sidebarOpen ? "←" : "☰"}
              </button>
            )}
            <div className="flex items-center gap-2">
              <img src={Logo} alt="reSEAlience" className="h-6 w-auto sm:h-7" />
              <p className="truncate text-sm font-extrabold tracking-tight text-[#16394a] sm:text-base">BakodDagat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">● Offline basemap</span>
            <Link to="/" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Home</Link>
          </div>
        </header>
      )}

      <div className="flex min-h-0 flex-1">
        {showSidebar && (
          <aside className="z-[500] flex w-[min(21rem,88vw)] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-[#fffefa] p-4 sm:w-80">
            {step === "fg" && (
              <FGMappingPanel
                timeOfDay={currentTime}
                progress={`Time ${timeIndex + 1} of ${timesOfDay.length}`}
                days={days}
                months={months}
                onToggleDay={toggle(setDays)}
                onToggleMonth={toggle(setMonths)}
                isDrawingRoute={activeTool === "route"}
                isPlacingPoint={activeTool === "fgpoint"}
                canDrawRoute={selectedIsPoint}
                canFinishRoute={draftPoints.length >= 1}
                hasSelectedPoint={Boolean(selectedFeature)}
                onAddPoint={startAddPoint}
                onRemovePoint={removePoint}
                onDrawRoute={startRoute}
                onFinishRoute={finishRoute}
                onCancelRoute={cancelRoute}
                onDeleteRoute={deleteRoute}
                onProceed={proceedFG}
                selectedPoint={selectedPoint}
                selectedRoute={selectedRoute}
                onPointRemarkChange={(value) => updateRemark(selectedPoint.id, value)}
                onRouteRemarkChange={(value) => updateRemark(selectedRoute.id, value)}
              />
            )}
            {step === "da" && (
              <DAMappingPanel
                hazards={hazards}
                points={hazardPoints}
                activeHazard={activeHazard}
                selectedId={selectedId}
                onSelectHazard={selectHazard}
                onSelectPoint={selectHazardPoint}
                onRemovePoint={removeFeatureById}
                canProceed={hazards.every((h) => (hazardCounts[h] || 0) > 0)}
                onProceed={proceedDA}
                onRemarkChange={updateRemark}
              />
            )}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <OfflineRegionDownloader />
            </div>
          </aside>
        )}

        <main className="relative min-w-0 flex-1 bg-[#dcecf0]">
          <OfflineMap
            features={features}
            draftPoints={draftPoints}
            activeTool={mapToolFor(activeTool)}
            onMapPoint={handleMapPoint}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="pointer-events-none absolute left-3 top-3 z-[400] max-w-[calc(100%-1.5rem)] rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:left-5 sm:top-5">
            <p className="text-xs font-bold text-slate-800 sm:text-sm">Panay Island & Guimaras</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Schematic offline geography · not for navigation</p>
          </div>
          {!isEmbeddedPreview && (
            <div className="absolute bottom-4 left-3 right-3 z-[400] flex items-end justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
              <p role="status" className="max-w-[75%] rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm backdrop-blur">{message}</p>
            </div>
          )}
        </main>
      </div>

      {/* Question steps as modals (none open in "preview") */}
      <ControlNumberModal open={step === "control"} initial={session} onSubmit={submitControl} />
      <FishingTimeModal open={step === "time"} initial={timesOfDay} onSubmit={submitTimes} onBack={() => goBack("time")} />
      <HazardSelectModal open={step === "hazards"} initial={hazards} onSubmit={submitHazards} onBack={() => goBack("hazards")} />
      <ReviewModal
        open={step === "review"}
        controlNumber={session.controlNumber}
        features={features}
        onExport={exportGeoJSON}
        onBack={() => goBack("review")}
        onRestart={restart}
      />
    </div>
  );
}
