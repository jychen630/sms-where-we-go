import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import geojson from 'geojson';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';
import { School, Student, StudentVerbose } from 'wwg-api';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

export type MapItem = School & { students?: (Student & StudentVerbose)[] };

export default function Map({ getData, getPopup }: { getData: () => Promise<MapItem[]>, getPopup: (props: MapItem) => JSX.Element }) {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!!mapRef.current && !!mapContainer.current) return;
        if (mapRef.current) return; // initialize map only once
        let lang = new MapboxLanguage({ defaultLanguage: 'zh', supportedLanguages: ['zh', 'en'] });
        const map = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v10',
        }).addControl(lang);

        let popup = new mapboxgl.Popup({ closeOnMove: true, closeOnClick: true });

        getData().then((result) => {
            const data = geojson.parse(result ?? [], { Point: ['latitude', 'longitude'] });
            console.log(data)

            map.on('load', () => {
                map.addLayer({
                    'id': 'schools',
                    'type': 'circle',
                    'source': {
                        'type': 'geojson',
                        'data': data
                    },
                    'paint': {
                        'circle-radius': 7,
                        'circle-color': "rgba(106,0,210,0.48)"
                    }
                });
            });

            map.on('mouseenter', 'schools', (e: any) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                map.getCanvas().style.cursor = "pointer";
                const container = document.createElement('div');
                ReactDOM.render(getPopup(e.features[0].properties), container);
                console.log(container);
                popup.setLngLat(coordinates).setDOMContent(container).addTo(map);
            });

            map.on('mouseleave', 'schools', (e: any) => {
                map.getCanvas().style.cursor = "";
            });

            mapRef.current = map as any;
        })
    });

    return <div className='map-container' ref={mapContainer}></div>
}
