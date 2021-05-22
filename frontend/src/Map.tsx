import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    useEffect(() => {
        if (!!map.current && !!mapContainer.current) return;
        if (map.current) return; // initialize map only once
        let lang = new MapboxLanguage({ defaultLanguage: 'zh', supportedLanguages: ['zh', 'en'] });
        map.current = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v10',
        }).addControl(lang) as any;
    });

    return <div className='map-container' ref={mapContainer}></div>
}
