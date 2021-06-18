declare module 'coordtransform' {
    declare function bd09togcj02(longitude: number, latitude: number): [longitude: number, latitude: number]
    declare function gcj02tobd09(longitude: number, latitude: number): [longitude: number, latitude: number]
    declare function wgs84togcj02(longitude: number, latitude: number): [longitude: number, latitude: number]
    declare function gcj02towgs84(longitude: number, latitude: number): [longitude: number, latitude: number]
}