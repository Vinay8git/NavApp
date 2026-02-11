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
import './MapMeasure.css';
import { SparkleIcon } from './Hero';

type RoutesFoundEvt = {
  routes: Array<{ summary?: { totalDistance?: number } }>;
};

function haversine(a: LatLngLiteral, b: LatLngLiteral) {
  const R = 6371;
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
  const defaultCenter: LatLngExpression = { lat: 12.9716, lng: 77.5946 };

  const [pts, setPts] = useState<State>({});
  const [useRoadRoute, setUseRoadRoute] = useState(false);
  const [measuredKm, setMeasuredKm] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);

  const mapRef = useRef<LeafletMap | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);

  /* Watch theme changes */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion(v => v + 1);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const routeColor = useMemo(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    return theme === "dark" ? "#4c9aff" : "#2d7bf0";
  }, [themeVersion]);

  const tileUrl = useMemo(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    return theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }, [themeVersion]);

  const createMarker = (color: string) =>
    L.divIcon({
      className: '',
      html: `<div style="
        width:14px;
        height:14px;
        background:${color};
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 0 0 3px ${color}55;
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

  const ClickCatcher: React.FC = () => {
    useMapEvent('click', (e) => {
      setMeasuredKm(null);
      setShowPopup(false);
      setPts((prev) => {
        if (!prev.src) return { src: e.latlng };
        if (!prev.dst) return { ...prev, dst: e.latlng };
        return { src: e.latlng, dst: undefined };
      });
    });
    return null;
  };

  const MapRef: React.FC = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  const straightLine = useMemo(() => {
    if (pts.src && pts.dst && !useRoadRoute) return [pts.src, pts.dst];
    return null;
  }, [pts, useRoadRoute]);

  useEffect(() => {
    if (!(pts.src && pts.dst)) return;

    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
    }

    if (!useRoadRoute) {
      setMeasuredKm(haversine(pts.src, pts.dst));
      return;
    }

    if (!mapRef.current) return;

    const plan = L.Routing.plan([L.latLng(pts.src), L.latLng(pts.dst)], {
      addWaypoints: false,
      createMarker: () => null
    });

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
          { color: routeColor, opacity: 0.25, weight: 10 },
          { color: routeColor, opacity: 0.95, weight: 4 }
        ]
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
    };
  }, [pts, useRoadRoute, routeColor]);

  const onMeasure = () => {
    setIsMeasuring(true);
    setShowPopup(true);
    setTimeout(() => setIsMeasuring(false), 800);
  };

  const onReset = () => {
    setPts({});
    setMeasuredKm(null);
    setShowPopup(false);
    if (routingRef.current) routingRef.current.remove();
  };

  return (
    <section className="map-section">
      <div className="map-panel">

        <div className="map-panel__left">
          <div className="hero__eyebrow">
              <SparkleIcon />
              Distance • Routing
          </div>
          <h2 className="map-title">Measure distance on the map</h2>
          <p className="map-sub">
            Click once for <strong>Source</strong>, Click again for <strong>Destination</strong>.
          </p>

          <div className="map-actions">
            <button
              className={`btn btn--primary ${isMeasuring ? 'btn--pulse' : ''}`}
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
              Use Road Route (OSRM)
            </label>
          </div>

          <div className="map-readout">
            <div className="chip">
              <span className="chip__dot" />
              Source: {pts.src ? `${pts.src.lat.toFixed(5)}, ${pts.src.lng.toFixed(5)}` : '—'}
            </div>

            <div className="chip">
              <span className="chip__dot chip__dot--b" />
              Destination: {pts.dst ? `${pts.dst.lat.toFixed(5)}, ${pts.dst.lng.toFixed(5)}` : '—'}
            </div>

            <div className="chip">
              Distance: {measuredKm ? fmtKm(measuredKm) : '—'}
            </div>
          </div>
        </div>

        <div className="map-panel__right">
          <div className="map-legend">
            <div><span className="legend-dot legend-dot--a" /> Source</div>
            <div><span className="legend-dot legend-dot--b" /> Destination</div>
            <div><span className="legend-line" /> Route</div>
          </div>

          <MapContainer
            center={defaultCenter}
            zoom={14}
            scrollWheelZoom
            className="map-card"
          >
            <MapRef />
            <TileLayer url={tileUrl} />
            <ClickCatcher />

            {pts.src && <Marker position={pts.src} icon={createMarker('#4c9aff')} />}
            {pts.dst && <Marker position={pts.dst} icon={createMarker('#34d399')} />}

            {straightLine && (
              <Polyline
                positions={straightLine}
                pathOptions={{
                  color: routeColor,
                  weight: 4,
                  opacity: 0.95
                }}
              />
            )}

            {pts.src && pts.dst && measuredKm && showPopup && (
              <Popup position={midPoint(pts.src, pts.dst)}>
                <strong>Distance:</strong> {fmtKm(measuredKm)}
              </Popup>
            )}
          </MapContainer>
        </div>

      </div>
    </section>
  );
};

export default MapMeasure;