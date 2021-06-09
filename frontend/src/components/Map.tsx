import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import geojson from 'geojson';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';
import { School, Student, StudentVerbose } from 'wwg-api';
import { Modal } from 'antd';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

export type MapItem = School & { students?: (Student & StudentVerbose)[] };

export default function Map({ getData, getPopup }: { getData: () => Promise<MapItem[]>, getPopup: (props: MapItem) => JSX.Element }) {
    const mapRef = useRef(null);
    const mapContainer = useRef(null);
    const [currentItem, setCurrentItem] = useState<MapItem>();
    const [showModal, setShowModal] = useState(false);

    const displayModalData = (e: any) => {
        let data = e.features[0].properties;
        data.students = JSON.parse(data.students);
        setCurrentItem(data)
        setShowModal(true);
    }

    useEffect(() => {
        if (!!mapRef.current && !!mapContainer.current) return;
        if (mapRef.current) return; // initialize map only once
        let lang = new MapboxLanguage({ defaultLanguage: 'zh', supportedLanguages: ['zh', 'en'] });
        const map = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v10',
            center: [114.121677, 22.551557],
            zoom: 1,
        }).addControl(lang);

        let popup = new mapboxgl.Popup({ closeOnMove: true, closeOnClick: true });

        getData().then((result) => {
            const data = geojson.parse(result ?? [], { Point: ['latitude', 'longitude'] });

            map.on('load', () => {
                map.addLayer({
                    'id': 'schools',
                    'type': 'circle',
                    'source': {
                        'type': 'geojson',
                        'data': data
                    },
                    'paint': {
                        'circle-radius': 10,
                        'circle-color': "rgba(24, 144, 255, 0.23)"
                    }
                });
            });

            map.on('mouseenter', 'schools', (e: any) => {
                let coordinates = e.features[0].geometry.coordinates.slice();
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                map.getCanvas().style.cursor = "pointer";
                const container = document.createElement('div');
                let data = e.features[0].properties;
                data.students = JSON.parse(data.students);
                ReactDOM.render(getPopup(data), container);
                popup.setLngLat(coordinates).setDOMContent(container).addTo(map);
            });

            map.on('mouseup', 'schools', displayModalData)

            //map.on('touchstart', 'schools', displayModalData)

            map.on('mouseleave', 'schools', (e: any) => {
                map.getCanvas().style.cursor = "";
            });

            mapRef.current = map as any;
        })
    });

    return (
        <>
            <div className='map-container' ref={mapContainer}></div>
            <Modal title={currentItem?.school_name} visible={showModal} onCancel={() => setShowModal(false)} footer={null} bodyStyle={{ padding: '0 0 0 0' }}>
                {currentItem !== undefined && getPopup(currentItem)}
            </Modal>
        </>
    )
}
