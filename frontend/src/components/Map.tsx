import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import geojson from 'geojson';
import mapboxgl, { Map as MapType } from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';
import { Coordinate, School, Student, StudentVerbose } from 'wwg-api';
import { Modal } from 'antd';
import { useCallback } from 'react';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

export type MapItem = School & { students?: (Student & StudentVerbose)[] };

export default function Map({ getData, getPopup, zoom = 5, startingCoordinate = { longitude: 114.121677, latitude: 22.551557 }, responsive = false }: { getData: () => Promise<MapItem[]>, getPopup: (props: MapItem) => JSX.Element, zoom?: number, startingCoordinate?: Coordinate, responsive?: boolean }) {
    const mapRef = useRef(null);
    const mapContainer = useRef(null);
    const [map, setMap] = useState<MapType>();
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState<MapItem>();

    useEffect(() => {
        if (!!!mapContainer || !!!mapContainer.current) return
        let lang = new MapboxLanguage({ defaultLanguage: 'zh', supportedLanguages: ['zh', 'en'] });
        const map = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v10',
        }).addControl(lang);
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        setMap(map);
    }, [mapContainer])

    const displayModalData = (e: any) => {
        let data = e.features[0].properties;
        data.students = JSON.parse(data.students);
        setCurrentItem(data)
        setShowModal(true);
    }

    const flyTo = useCallback(() => {
        if (!!map)
            map?.flyTo({
                center: [startingCoordinate.longitude, startingCoordinate.latitude],
                zoom: zoom
            })
    }, [map, zoom, startingCoordinate]);

    useEffect(() => {
        if (!!!map) return;

        let popup = new mapboxgl.Popup({ closeOnMove: true, closeOnClick: true });

        map.on('mouseenter', 'schools', (e: any) => {
            let coordinates = e.features[0].geometry.coordinates.slice();
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            map.getCanvas().style.cursor = "pointer";
            const container = document.createElement('div');
            let data = e.features[0].properties;
            data.students = !!data.students ? JSON.parse(data.students) : [];
            ReactDOM.render(getPopup(data), container);
            popup.setLngLat(coordinates).setDOMContent(container).addTo(map);
        });

        map.on('mouseup', 'schools', displayModalData)

        map.on('mouseleave', 'schools', (e: any) => {
            map.getCanvas().style.cursor = "";
        });
    }, [map, getData, getPopup]);

    useEffect(() => {
        flyTo()
    }, [flyTo]);

    useEffect(() => {
        if (!!!map || !!!mapRef.current) return;
        getData().then((result) => {
            const data = geojson.parse(result ?? [], { Point: ['latitude', 'longitude'] });
            try {
                if (map.getLayer('schools') !== undefined) {
                    map.removeLayer('schools')
                        .removeSource('schools')
                }
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
            }
            catch (err) {
                console.error(err);
            }
        });
    }, [map, getData, startingCoordinate])

    useEffect(() => {
        if (!!!map) return;

        getData().then((result) => {
            const data = geojson.parse(result ?? [], { Point: ['latitude', 'longitude'] });
            map.on('load', () => {
                flyTo();

                if (map.getLayer('schools') !== undefined) return

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
                mapRef.current = map as any;
            })
        })
    }, [map, flyTo, getData]);

    return (
        <>
            <div className={responsive ? 'map-container-responsive' : 'map-container'} ref={mapContainer}></div>
            <Modal title={currentItem?.school_name} visible={showModal} onCancel={() => setShowModal(false)} footer={null} bodyStyle={{ padding: '0 0 0 0' }}>
                {currentItem !== undefined && getPopup(currentItem)}
            </Modal>
        </>
    )
}
