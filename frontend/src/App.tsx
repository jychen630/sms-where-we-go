import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import mapboxgl from 'mapbox-gl';
import './App.css';


mapboxgl.accessToken = "pk.eyJ1IjoiYWNraW5kbGUzIiwiYSI6ImNrYzYzcWFnOTA5bjQycnRlY2t4OWxlMWUifQ.a3wwi4cHq1sHakuoT9Bo0w";

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
