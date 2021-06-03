import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

export default function Map() {
    const mapContainer = useRef(null);
    useEffect(() => {
        let lang = new MapboxLanguage({ defaultLanguage: 'zh', supportedLanguages: ['zh', 'en'] });
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v10',
    });

    return <div className='map-container' ref={mapContainer}></div>
}
