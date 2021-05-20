import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import mapboxgl from 'mapbox-gl';
import './App.css';


mapboxgl.accessToken = "your.mapbox.token.here";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  useEffect(() => {
    if (!!map.current && !!mapContainer.current) return;
    if (map.current) return; // initialize map only once
    // @ts-ignore
    map.current = new mapboxgl.Map({  
      // @ts-ignore
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    });
  });
  return (
    <div className="App">
      <div className="map-container" ref={mapContainer}></div>
    </div>
  );
}

export default App;
