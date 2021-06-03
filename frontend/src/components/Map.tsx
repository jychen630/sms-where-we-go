import { useEffect, useRef } from 'react';
import geojson from 'geojson';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';
import { Service } from 'wwg-api';
import { handleApiError } from '../api/utils';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

const getRoster = async () => {
    return Service.getRoster()
        .then((result) => {
            console.log('Recieved data');
            console.log(result.schools);
            return result.schools.filter((school) => !!school.latitude && !!school.longitude);;
        })
        .catch((err) => handleApiError(err).then(res => { console.error(err); return [] }));
}

export default function Map() {
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

        getRoster().then((result) => {
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

                popup.setLngLat(coordinates).setHTML("<h1>asd</h1>").addTo(map);
            });

            mapRef.current = map as any;
        })
    });

    return <div className='map-container' ref={mapContainer}></div>
}
