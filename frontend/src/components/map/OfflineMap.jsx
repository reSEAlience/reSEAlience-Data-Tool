import { useEffect, useRef, useState } from "react";
import {
  Map,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import {
  OfflineMapManager,
  OfflineManagerControl,
} from "map-gl-offline";
import "map-gl-offline/style.css";

import workerUrl from
  "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

maplibregl.setWorkerUrl(workerUrl);

const STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";

const offlineManager = new OfflineMapManager();



// Configure the MapLibre worker for Vite.
setWorkerUrl(workerUrl);

const EMPTY_GEOJSON = {
  type: "FeatureCollection",
  features: [],
};

const WEB_MERCATOR_RADIUS = 6378137;

const COLORS = {
  ground: "#14b8a6",
  route: "#2563eb",
  hazard: "#ef4444",
  incident: "#fb923c",
};

function toCoordinates(points = []) {
  // Your existing points use [latitude, longitude].
  // GeoJSON and MapLibre use [longitude, latitude].
  return points.map(([lat, lng]) => [lng, lat]);
}

function toFeatureCollection(features = [], selectedId) {
  return {
    type: "FeatureCollection",
    features: features.flatMap((feature) => {
      const coordinates = toCoordinates(feature.points || []);
      const properties = {
        featureId: String(feature.id),
        name: feature.name || "",
        kind: feature.kind || "ground",
        selected: feature.id === selectedId,
      };

      if (feature.kind === "ground" && coordinates.length >= 3) {
        return [{
          type: "Feature",
          properties,
          geometry: {
            type: "Polygon",
            coordinates: [[
              ...coordinates,
              coordinates[0],
            ]],
          },
        }];
      }

      if (feature.kind === "route" && coordinates.length >= 2) {
        return [{
          type: "Feature",
          properties,
          geometry: {
            type: "LineString",
            coordinates,
          },
        }];
      }

      if (
        ["hazard", "incident"].includes(feature.kind) &&
        coordinates.length > 0
      ) {
        return [{
          type: "Feature",
          properties,
          geometry: {
            type: "Point",
            coordinates: coordinates[0],
          },
        }];
      }

      return [];
    }),
  };
}

function toDraftCollection(draftPoints = [], activeTool) {
  const coordinates = toCoordinates(draftPoints);
  const features = [];

  if (
    coordinates.length >= 2 &&
    ["route", "ground"].includes(activeTool)
  ) {
    features.push({
      type: "Feature",
      properties: { draftType: activeTool },
      geometry: {
        type: "LineString",
        coordinates,
      },
    });
  }

  coordinates.forEach((coordinate, index) => {
    features.push({
      type: "Feature",
      properties: { index },
      geometry: {
        type: "Point",
        coordinates: coordinate,
      },
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function reprojectGeometry(geometry) {
  if (!geometry) return geometry;

  if (geometry.type === "GeometryCollection") {
    return {
      ...geometry,
      geometries: geometry.geometries.map(reprojectGeometry),
    };
  }

  function reprojectCoordinates(value) {
    if (!Array.isArray(value)) return value;

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      const [x, y, ...rest] = value;
      return [
        (x / WEB_MERCATOR_RADIUS) * (180 / Math.PI),
        (2 * Math.atan(Math.exp(y / WEB_MERCATOR_RADIUS)) - Math.PI / 2) *
          (180 / Math.PI),
        ...rest,
      ];
    }

    return value.map(reprojectCoordinates);
  }

  return {
    ...geometry,
    coordinates: reprojectCoordinates(geometry.coordinates),
  };
}

function normalizeGeoJSON(data) {
  const crsName = data.crs?.properties?.name;

  if (!crsName || !crsName.endsWith("3857")) return data;

  const geojson = { ...data };
  delete geojson.crs;

  if (geojson.type === "FeatureCollection") {
    return {
      ...geojson,
      features: geojson.features.map((feature) => ({
        ...feature,
        geometry: reprojectGeometry(feature.geometry),
      })),
    };
  }

  if (geojson.type === "Feature") {
    return {
      ...geojson,
      geometry: reprojectGeometry(geojson.geometry),
    };
  }

  return reprojectGeometry(geojson);
}

function getGeoJSONBounds(data) {
  const bounds = [
    [Infinity, Infinity],
    [-Infinity, -Infinity],
  ];

  function visit(value) {
    if (!Array.isArray(value)) return;

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      const [lng, lat] = value;

      bounds[0][0] = Math.min(bounds[0][0], lng);
      bounds[0][1] = Math.min(bounds[0][1], lat);
      bounds[1][0] = Math.max(bounds[1][0], lng);
      bounds[1][1] = Math.max(bounds[1][1], lat);
      return;
    }

    value.forEach(visit);
  }

  function visitGeometry(geometry) {
    if (!geometry) return;

    if (geometry.type === "GeometryCollection") {
      geometry.geometries.forEach(visitGeometry);
    } else {
      visit(geometry.coordinates);
    }
  }

  if (data.type === "FeatureCollection") {
    data.features.forEach((feature) =>
      visitGeometry(feature.geometry)
    );
  } else if (data.type === "Feature") {
    visitGeometry(data.geometry);
  } else {
    visitGeometry(data);
  }

  if (!Number.isFinite(bounds[0][0])) return null;
  return bounds;
}

export default function OfflineMap({
  features = [],
  draftPoints = [],
  activeTool = "pan",
  onMapPoint,
  selectedId,
  onSelect,
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  // Keep event handlers connected to the latest React props.
  const propsRef = useRef({});
  propsRef.current = {
    activeTool,
    onMapPoint,
    onSelect,
  };

  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [regionData, setRegionData] = useState(null);

  // Initialize MapLibre once.
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    let disposed = false;

    
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLE_URL,
      center: [122.55, 11.05],
      zoom: 8,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: {
        compact: true,
      },
    });


    mapInstance.current = map;

    
  map.addControl(
    new OfflineManagerControl(offlineManager, {
      styleUrl: STYLE_URL,
      mapLib: maplibregl,
    }),
    "top-right"
  );


    map.on("load", () => {
      if (disposed) return;

      map.addSource("regional-data", {
        type: "geojson",
        data: EMPTY_GEOJSON,
      });

      map.addLayer({
        id: "regional-fill",
        type: "fill",
        source: "regional-data",
        paint: {
          "fill-color": "#dce9d9",
          "fill-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "regional-outline",
        type: "line",
        source: "regional-data",
        paint: {
          "line-color": "#8aa99b",
          "line-width": 1.5,
        },
      });

      map.addSource("user-features", {
        type: "geojson",
        data: EMPTY_GEOJSON,
      });

      map.addLayer({
        id: "ground-fill",
        type: "fill",
        source: "user-features",
        filter: ["==", ["get", "kind"], "ground"],
        paint: {
          "fill-color": COLORS.ground,
          "fill-opacity": [
            "case",
            ["get", "selected"],
            0.5,
            0.28,
          ],
        },
      });

      map.addLayer({
        id: "ground-outline",
        type: "line",
        source: "user-features",
        filter: ["==", ["get", "kind"], "ground"],
        paint: {
          "line-color": "#0f766e",
          "line-width": [
            "case",
            ["get", "selected"],
            4,
            2.5,
          ],
        },
      });

      map.addLayer({
        id: "route-lines",
        type: "line",
        source: "user-features",
        filter: ["==", ["get", "kind"], "route"],
        paint: {
          "line-color": COLORS.route,
          "line-width": [
            "case",
            ["get", "selected"],
            5,
            3.5,
          ],
          "line-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "hazard-points",
        type: "circle",
        source: "user-features",
        filter: ["in", ["get", "kind"], ["literal", ["hazard", "incident"]]],
        paint: {
          "circle-color": [
            "match",
            ["get", "kind"],
            "hazard", COLORS.hazard,
            "incident", COLORS.incident,
            "#0f766e",
          ],
          "circle-radius": [
            "case",
            ["get", "selected"],
            9,
            7,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": [
            "case",
            ["get", "selected"],
            4,
            2,
          ],
        },
      });

      map.addSource("draft-features", {
        type: "geojson",
        data: EMPTY_GEOJSON,
      });

      map.addLayer({
        id: "draft-line",
        type: "line",
        source: "draft-features",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": "#0f766e",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });

      map.addLayer({
        id: "draft-points",
        type: "circle",
        source: "draft-features",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 5,
          "circle-color": "#0f766e",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.on("click", (event) => {
        const current = propsRef.current;

        // Select an existing feature if one was clicked.
        const rendered = map.queryRenderedFeatures(
          event.point,
          {
            layers: [
              "ground-fill",
              "ground-outline",
              "route-lines",
              "hazard-points",
            ],
          }
        );

        const clickedFeature = rendered.find(
          (item) => item.properties?.featureId != null
        );

        if (clickedFeature) {
          current.onSelect?.(
            clickedFeature.properties.featureId
          );
          return;
        }

        // Otherwise, pass the clicked location to the
        // existing drawing workflow.
        if (current.activeTool !== "pan") {
          current.onMapPoint?.([
            event.lngLat.lat,
            event.lngLat.lng,
          ]);
        }
      });

      map.on("error", (event) => {
        console.error("MapLibre error:", event.error);
      });

      setMapReady(true);
    });

    map.on("error", (event) => {
      console.error("Map initialization error:", event.error);
    });

    return () => {
      disposed = true;
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Load the regional GeoJSON.
  useEffect(() => {
    let cancelled = false;

    async function loadRegionData() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/Region_Six_Polygons.geojson`
        );

        if (!response.ok) {
          throw new Error(
            `Could not load regional GeoJSON (${response.status}).`
          );
        }

        const data = normalizeGeoJSON(await response.json());

        if (
          data.type !== "FeatureCollection" &&
          data.type !== "Feature" &&
          !data.type?.endsWith("Geometry")
        ) {
          throw new Error("The regional file is not valid GeoJSON.");
        }

        if (!cancelled) {
          setRegionData(data);
          setMapError("");
        }
      } catch (error) {
        if (!cancelled) {
          setMapError(error.message);
        }
      }
    }

    loadRegionData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update regional geometry when loaded.
  useEffect(() => {
    const map = mapInstance.current;

    if (!mapReady || !map || !regionData) return;

    const source = map.getSource("regional-data");
    if (!source) return;

    source.setData(regionData);

    const bounds = getGeoJSONBounds(regionData);

    if (bounds) {
      map.fitBounds(bounds, {
        padding: 20,
        maxZoom: 12,
        duration: 0,
      });
    }
  }, [mapReady, regionData]);

  // Update the maritime features when React props change.
  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;

    const source = map.getSource("user-features");

    source?.setData(
      toFeatureCollection(features, selectedId)
    );
  }, [mapReady, features, selectedId]);

  // Update draft points during drawing.
  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;

    const source = map.getSource("draft-features");

    source?.setData(
      toDraftCollection(draftPoints, activeTool)
    );
  }, [mapReady, draftPoints, activeTool]);

  return (
    <div className="relative h-full w-full">
      {mapError && (
        <div className="absolute left-3 top-3 z-10 max-w-sm rounded bg-white p-3 text-sm text-red-700 shadow">
          {mapError}
        </div>
      )}

      <div
        ref={mapContainer}
        className="h-full w-full"
        style={{ minHeight: 300 }}
      />
    </div>
  );
}