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
                        'circle-radius': 7,
                        'circle-color': "rgba(106,0,210,0.48)"
                    }
                });
            });

            map.on('mouseenter', 'schools', (e: any) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                map.getCanvas().style.cursor = "pointer";
                const container = document.createElement('div');
                let data = e.features[0].properties;
                data.students = JSON.parse(data.students);
                ReactDOM.render(getPopup(data), container);
                popup.setLngLat(coordinates).setDOMContent(container).addTo(map);
            });

            map.on('mouseup', 'schools', displayModalData)

            map.on('touchstart', 'schools', displayModalData)

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
