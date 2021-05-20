import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import mapboxgl from 'mapbox-gl';
import './App.css';
import Map from './Map';

mapboxgl.accessToken = "pk.eyJ1IjoiYWNraW5kbGUzIiwiYSI6ImNrYzYzcWFnOTA5bjQycnRlY2t4OWxlMWUifQ.a3wwi4cHq1sHakuoT9Bo0w";

function App() {

  return (
    <div className="App">
      <Map />
    </div>
  );
}

export default App;
