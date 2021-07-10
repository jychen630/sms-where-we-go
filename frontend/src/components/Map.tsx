import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import geojson from 'geojson';
import mapboxgl, { Map as MapType } from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';
import { Coordinate, School, Student, StudentVerbose } from 'wwg-api';
import LeftCircleOutlined from '@ant-design/icons/LeftCircleOutlined';
import { useCallback } from 'react';
import StudentSearchTool from './StudentSearchTool';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

export type MapItem = School & { students?: (Student & StudentVerbose)[] };

const DEFAULT_CENTER = { longitude: 114.121677, latitude: 22.551557 };

const convertCoordinates = (e: any): [number, number] => {
    let coordinates = e.features[0].geometry.coordinates.slice();
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    return coordinates
}

export default function Map({ getData, getPopup, zoom = 5, startingCoordinate = DEFAULT_CENTER, responsive = false }: { getData: () => Promise<MapItem[]>, getPopup: (props: MapItem) => JSX.Element, zoom?: number, startingCoordinate?: Coordinate, responsive?: boolean }) {
    const mapRef = useRef(null);
    const isMobile = window.innerWidth <= 576;
    const [focus, setFocus] = useState<[number, number] | undefined>();
    const [infoBarHidden, setInfoBarHidden] = useState(true);
    const mapContainer = useRef(null);
    const [data, setData] = useState<MapItem[]>([]);
    const [map, setMap] = useState<MapType>();
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
    }, [mapContainer]);

    const flyTo = useCallback((lng = startingCoordinate.longitude, lat = startingCoordinate.latitude) => {
        if (!!map) {
            map.flyTo({
                center: [lng, lat],
                zoom: zoom
            })
        }
    }, [map, zoom, startingCoordinate]);

    useEffect(() => {
        if (!!focus) {
            flyTo(focus[0], focus[1]);
        }
    }, [focus]);

    useEffect(() => {
        setFocus([startingCoordinate.longitude, startingCoordinate.latitude]);
    }, [startingCoordinate])

    useEffect(() => {
        if (!!!map) return;

        let tempPopup = new mapboxgl.Popup({ closeOnMove: true, closeOnClick: true });

        function handleMouseEnter(e: any) {
            // We disable the popup on mobile devices due to its bad performance
            if (!!!map || isMobile) return;
            const coordinates = convertCoordinates(e);
            map.getCanvas().style.cursor = "pointer";
            const container = document.createElement('div');
            let data = e.features[0].properties;
            data.students = !!data.students ? JSON.parse(data.students) : [];
            ReactDOM.render(getPopup(data), container);
            tempPopup.setLngLat(coordinates).setDOMContent(container).addTo(map);
        }

        function handleMouseUp(e: any) {
            if (!!!map) return;
            let data = e.features[0].properties;
            data.students = JSON.parse(data.students);
            setCurrentItem(data);
            setInfoBarHidden(false);
            setFocus(e.features[0].geometry.coordinates);
        }

        function handleMouseLeave(e: any) {
            if (!!!map) return;
            map.getCanvas().style.cursor = "";
        }

        map.on('mouseenter', 'schools', handleMouseEnter);
        map.on('mouseup', 'schools', handleMouseUp)
        map.on('mouseleave', 'schools', handleMouseLeave);

        return () => {
            // Do a cleanup to deduplicate event handlers 
            map.off('mouseenter', 'schools', handleMouseEnter);
            map.off('mouseup', 'schools', handleMouseUp)
            map.off('mouseleave', 'schools', handleMouseLeave);
        }
    }, [map, isMobile, flyTo, getPopup]);

    useEffect(() => {
        // Handle data update after the map has been loaded
        if (!!!map || !!!mapRef.current) return;

        getData().then((result) => {
            setData(result);
            const data = geojson.parse(result ?? [], { Point: ['latitude', 'longitude'] });
            try {
                if (map.getLayer('schools') !== undefined) {
                    (map.getSource('schools') as any).setData(data);
                }
                else {
                    map.addLayer({
                        'id': 'schools',
                        'type': 'circle',
                        'source': {
                            'type': 'geojson',
                            'data': data
                        },
                        'paint': {
                            'circle-radius': 10,
                            'circle-color': "rgba(24, 144, 255, 0.8)"
                        }
                    });
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    }, [map, getData])

    useEffect(() => {
        // Handle data fetching when the map is first loaded
        if (!!!map) return;

        getData().then((result) => {
            if (result.length === 0) {
                return;
            }
            setData(result);
            const data = geojson.parse(result, { Point: ['latitude', 'longitude'] });
            map.on('load', () => {
                if (map.getLayer('schools') !== undefined) return

                setFocus([startingCoordinate.longitude, startingCoordinate.latitude]);
                map.addLayer({
                    'id': 'schools',
                    'type': 'circle',
                    'source': {
                        'type': 'geojson',
                        'data': data
                    },
                    'paint': {
                        'circle-radius': 10,
                        'circle-color': "rgba(24, 144, 255, 0.8)"
                    }
                });
                mapRef.current = map as any;
            })
        });
    }, [map, setFocus, getData, startingCoordinate]);

    return (
        <>
            <div className={responsive ? 'map-container-responsive' : 'map-container'} ref={mapContainer}></div>
            {!responsive &&
                <div className={`info-bar-container${infoBarHidden ? " info-bar-hidden" : ""}`}>
                    <div className="info-bar">
                        <LeftCircleOutlined className="info-bar-switch" onClick={() => setInfoBarHidden(!infoBarHidden)} />
                        <div className="info-bar-content">
                            <div style={{ padding: "1 1 1 1" }}>
                                <StudentSearchTool
                                    data={data}
                                    onSelect={(val) => {
                                        setFocus([val.coordinates[0], val.coordinates[1]]);
                                        setCurrentItem(val.original);
                                    }}
                                />
                                {!!currentItem ? getPopup(currentItem) : <></>}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
