import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef } from 'react';
import './Map.css';

mapboxgl.accessToken = "pk.eyJ1IjoiYWNraW5kbGUzIiwiYSI6ImNrYzYzcWFnOTA5bjQycnRlY2t4OWxlMWUifQ.a3wwi4cHq1sHakuoT9Bo0w";

export default function Map(){
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
    return(<div className="map-container" ref={mapContainer}>map</div>)
}