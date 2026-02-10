import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvent,
  useMap
} from 'react-leaflet';
import type { LatLngExpression, LatLngLiteral, Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './map.css';

/** ------- Fix default Leaflet marker icons for Vite/webpack builds ------- */
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
/** ----------------------------------------------------------------------- */

/** Minimal type for the LRM 'routesfound' event payload we consume */
type RoutesFoundEvt = {
  routes: Array<{ summary?: { totalDistance?: number } }>;
};

/** Straight-line distance (Haversine) in KM */
function haversine(a: LatLngLiteral, b: LatLngLiteral) {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

const fmtKm = (km: number) =>
  `${km.toFixed(km >= 100 ? 0 : km >= 10 ? 1 : 2)} km`;

const midPoint = (a: LatLngLiteral, b: LatLngLiteral): LatLngLiteral => ({
  lat: (a.lat + b.lat) / 2,
  lng: (a.lng + b.lng) / 2
});

type State = {
  src?: LatLngLiteral;
  dst?: LatLngLiteral;
};

const MapMeasure: React.FC = () => {
  // Bengaluru default center
  const defaultCenter: LatLngExpression = { lat: 12.9716, lng: 77.5946 };

  const [pts, setPts] = useState<State>({});
  const [useRoadRoute, setUseRoadRoute] = useState(false);
  const [measuredKm, setMeasuredKm] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Hold map + routing control instances
  const mapRef = useRef<LeafletMap | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);

  /** Handle clicks: Source -> Destination -> restart with new Source */
  const ClickCatcher: React.FC = () => {
    useMapEvent('click', (e) => {
      setMeasuredKm(null);
      setShowPopup(false);
      setPts((prev) => {
        if (!prev.src) return { src: e.latlng };
        if (!prev.dst) return { ...prev, dst: e.latlng };
        return { src: e.latlng, dst: undefined }; // restart cycle with new Source
      });
    });
    return null;
  };

  /** Obtain the map instance from React-Leaflet (v4+ pattern) */
  const MapRef: React.FC = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  /** Straight-line polyline if routing is OFF */
  const straightLine = useMemo<LatLngExpression[] | null>(() => {
    if (pts.src && pts.dst && !useRoadRoute) return [pts.src, pts.dst];
    return null;
  }, [pts, useRoadRoute]);

  /** Compute distance when points or the routing mode change */
  useEffect(() => {
    if (!(pts.src && pts.dst)) return;

    // Remove any old routing UI
    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
    }

    if (!useRoadRoute) {
      // Haversine (no API call)
      setMeasuredKm(haversine(pts.src, pts.dst));
      return;
    }

    // Ensure map is ready for LRM
    if (!mapRef.current) return;

    // Plan: lock user interactions (no dragging markers, no adding waypoints)
    const plan = L.Routing.plan([L.latLng(pts.src), L.latLng(pts.dst)], {
      addWaypoints: false,
      createMarker: (_i, wp) => L.marker(wp.latLng, { draggable: false })
    });

    // LRM control (OSRM demo backend)
    const control = L.Routing.control({
      plan,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      fitSelectedRoutes: true,
      show: false,
      routeWhileDragging: false,
      lineOptions: {
        styles: [
          { color: '#2d7bf0', opacity: 0.25, weight: 8 }, // halo
          { color: '#2d7bf0', opacity: 0.95, weight: 4 }  // main line
        ],
        extendToWaypoints: false,
        missingRouteTolerance: 1
      }
    })
      .on('routesfound', (e: RoutesFoundEvt) => {
        const meters = e.routes?.[0]?.summary?.totalDistance;
        if (typeof meters === 'number') setMeasuredKm(meters / 1000);
      })
      .addTo(mapRef.current);

    routingRef.current = control;

    return () => {
      control.remove();
      if (routingRef.current === control) routingRef.current = null;
    };
  }, [pts, useRoadRoute]);

  const popupText = useMemo(() => {
    if (!(pts.src && pts.dst && measuredKm != null)) return '';
    const A = `${pts.src.lat.toFixed(5)}, ${pts.src.lng.toFixed(5)}`;
    const B = `${pts.dst.lat.toFixed(5)}, ${pts.dst.lng.toFixed(5)}`;
    return `Distance between Point ${A} and Point ${B} = ${fmtKm(measuredKm)}`;
  }, [pts, measuredKm]);

  const onMeasure = () => setShowPopup(true);
  const onReset = () => {
    setPts({});
    setMeasuredKm(null);
    setShowPopup(false);
    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
    }
  };

  return (
    <section className="map-section" aria-labelledby="measure-title">
      <div className="map-panel">
        {/* LEFT: Controls + Readout */}
        <div className="map-panel__left">
          <div className="map-eyebrow">Distance • Routing</div>
          <h2 id="measure-title" className="map-title">Measure distance on the map</h2>
          <p className="map-sub">
            Click once for <strong>Source</strong>, Click again for <strong>Destination</strong>.
            Toggle “Use Road Route (OSRM)” to snap to roads, or keep it off for straight-line.
          </p>

          <ul className="map-hints">
            <li>Easy Route Calculation</li>
            <li>OpenStreetMap gives vibrant highlights.</li>
            <li>Direct & Road Route Distance</li>
          </ul>

          <div className="map-actions">
            <button
              className="btn btn--primary"
              disabled={!(pts.src && pts.dst)}
              onClick={onMeasure}
            >
              Measure Distance
            </button>
            <button className="btn btn--ghost" onClick={onReset}>
              Reset
            </button>

            <label className="toggle">
              <input
                type="checkbox"
                checked={useRoadRoute}
                onChange={(e) => setUseRoadRoute(e.target.checked)}
              />
              <span className="toggle__label">Use Road Route (OSRM)</span>
            </label>
          </div>

          <div className="map-readout">
            <div className="chip">
              <span className="chip__dot" /> Source:{' '}
              {pts.src ? `${pts.src.lat.toFixed(5)}, ${pts.src.lng.toFixed(5)}` : '—'}
            </div>
            <div className="chip">
              <span className="chip__dot chip__dot--b" /> Destination:{' '}
              {pts.dst ? `${pts.dst.lat.toFixed(5)}, ${pts.dst.lng.toFixed(5)}` : '—'}
            </div>
            <div className="chip chip--accent">
              Distance: {measuredKm != null ? fmtKm(measuredKm) : '—'}
            </div>
          </div>
        </div>

        {/* RIGHT: Map (fills the screen height thanks to CSS) */}
        <div className="map-panel__right">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom
            className="map-card"
            // extra safety; CSS already targets ~80vh
            style={{ minHeight: '75vh' }}
          >
            <MapRef />

            {/* ✅ Correct, self-closing TileLayer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickCatcher />

            {pts.src && <Marker position={pts.src} />}
            {pts.dst && <Marker position={pts.dst} />}

            {straightLine && (
              <Polyline
                positions={straightLine}
                pathOptions={{ color: '#2d7bf0', weight: 4, opacity: 0.95 }}
              />
            )}

            {pts.src && pts.dst && measuredKm != null && showPopup && (
              <Popup position={midPoint(pts.src, pts.dst)}>
                <div className="popup-theme">
                  <strong>Measure Distance</strong>
                  <div style={{ marginTop: 6 }}>{popupText}</div>
                </div>
              </Popup>
            )}
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default MapMeasure;