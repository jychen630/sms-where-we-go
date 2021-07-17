import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import geojson from 'geojson';
import mapboxgl, { Map as MapType } from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import './Map.css';
import { Modal } from 'antd';
import { Coordinate, School, Student, StudentVerbose } from 'wwg-api';
import LeftCircleOutlined from '@ant-design/icons/LeftCircleOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import UpSquareOutlined from '@ant-design/icons/UpSquareOutlined';
import FullscreenExitOutlined from '@ant-design/icons/FullscreenExitOutlined';
import SolutionOutlined from '@ant-design/icons/SolutionOutlined';
import { useCallback } from 'react';
import StudentSearchTool from './StudentSearchTool';
import MapControl from './MapControl';

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

export default function Map({ getData, getPopup, zoom, initialZoom = 5, startingCoordinate = DEFAULT_CENTER, responsive = false }: { getData: () => Promise<MapItem[]>, getPopup: (props: MapItem[]) => JSX.Element, zoom?: number, initialZoom?: number, startingCoordinate?: Coordinate, responsive?: boolean }) {
    const mapRef = useRef(null);
    const mapContainer = useRef(null);
    const [map, setMap] = useState<MapType>();
    const isMobile = window.innerWidth <= 576;
    const [data, setData] = useState<MapItem[]>([]);
    const [autoFlyTo, setAutoFlyTo] = useState(true);
    const [showPopup, setShowPopup] = useState(true);
    const [modalMode, setModalMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [infoBarHidden, setInfoBarHidden] = useState(true);
    const [focus, setFocus] = useState<[number, number] | undefined>();
    const [currentItem, setCurrentItem] = useState<MapItem[]>();

    useEffect(() => {
        if (!!!mapContainer || !!!mapContainer.current) return
        let lang = new MapboxLanguage({ defaultLanguage: 'zh', supportedLanguages: ['zh', 'en'] });
        const map = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v10',
            zoom: initialZoom,
        }).addControl(lang);
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        setMap(map);
    }, [initialZoom, mapContainer]);

    const flyTo = useCallback((lng = startingCoordinate.longitude, lat = startingCoordinate.latitude) => {
        if (!!map) {
            if (!!zoom) {
                map.flyTo({
                    center: [lng, lat],
                    duration: 250,
                    zoom: zoom,
                });
            }
            else {
                map.flyTo({
                    center: [lng, lat],
                    duration: 250,
                });
            }
        }
    }, [map, zoom, startingCoordinate]);

    useEffect(() => {
        if (!!focus && autoFlyTo) {
            flyTo(focus[0], focus[1]);
        }
    }, [focus, autoFlyTo]);

    useEffect(() => {
        setFocus([startingCoordinate.longitude, startingCoordinate.latitude]);
    }, [startingCoordinate])

    useEffect(() => {
        if (!!!map) return;

        let tempPopup = new mapboxgl.Popup({ closeOnMove: true, closeOnClick: true });

        function handleMouseEnter(e: any) {
            // We disable the popup on mobile devices due to its bad performance
            if (!!!map) return;
            map.getCanvas().style.cursor = "pointer";
            let data = e.features.map((feature: any) => {
                feature.properties.students = JSON.parse(feature.properties.students ?? []);
                return feature.properties;
            });
            setCurrentItem(data);
            if (isMobile) return;
            const coordinates = convertCoordinates(e);
            const container = document.createElement('div');
            if (showPopup) {
                ReactDOM.render(getPopup(data), container);
            }
            else {
                ReactDOM.render(data.school_name, container);
            }
            tempPopup.setLngLat(coordinates).setDOMContent(container).addTo(map);
        }

        function handleMouseUp(e: any) {
            if (!!!map) return;
            let data = e.features.map((feature: any) => {
                feature.properties.students = JSON.parse(feature.properties.students ?? []);
                return feature.properties;
            });
            setCurrentItem(data);
            setInfoBarHidden(false);
            setShowModal(true);
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
    }, [map, isMobile, flyTo, getPopup, showPopup]);

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
                <div className="floating-control-container">
                    <div>
                        <MapControl
                            onToggle={(toggle) => {
                                setModalMode(toggle);
                                setShowModal(false);
                                setInfoBarHidden(true);
                            }}
                            Content={() => <GroupOutlined />}
                            AltContent={() => isMobile ? <UpSquareOutlined /> : <LeftCircleOutlined style={{ transform: "rotate(180deg)" }} />}
                        />
                        <MapControl
                            onToggle={(toggle) => {
                                setAutoFlyTo(toggle);
                            }}
                            defaultToggled={true}
                            altType='ghost'
                            Content={() => <FullscreenExitOutlined />}
                        />
                        {!isMobile &&
                            <MapControl
                                onToggle={(toggle) => {
                                    setShowPopup(toggle);
                                }}
                                defaultToggled={true}
                                altType='ghost'
                                Content={() => <SolutionOutlined />}
                            />
                        }
                    </div>
                </div>
            }
            <Modal title={currentItem && currentItem?.length > 0 ? currentItem[0].school_name : undefined} visible={modalMode && showModal} onCancel={() => setShowModal(false)} footer={null} bodyStyle={{ padding: '0 0 0 0' }}>
                {currentItem !== undefined && getPopup(currentItem)}
            </Modal>
            {!modalMode && !responsive &&
                <div className={`info-bar-container${infoBarHidden ? " info-bar-hidden" : ""}`}>
                    <div className="info-bar">
                        <LeftCircleOutlined className="info-bar-switch" onClick={() => setInfoBarHidden(!infoBarHidden)} />
                        <div className="info-bar-content">
                            <div style={{ padding: "1 1 1 1" }}>
                                <StudentSearchTool
                                    data={data}
                                    onSelect={(val) => {
                                        if (val.coordinates) {
                                            setFocus([val.coordinates[0], val.coordinates[1]]);
                                        }
                                        setCurrentItem([val.original]);
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
