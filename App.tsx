import './App.css';
import Navbar from './Components/Navbar';
import Hero from './Components/Hero';
import MapMeasure from './Components/MapMeasure';

// Leaflet styles (load once)
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

export default function App() {
  return (
    <>
      <Navbar />
      <div className="nav-spacer" /> {/* keeps content below the fixed header */}
      <Hero />
      <MapMeasure />
    </>
  );
}