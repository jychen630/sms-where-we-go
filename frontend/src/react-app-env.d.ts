/// <reference types="react-scripts" />
declare module "@mapbox/mapbox-gl-language";
declare module "geojson" {
    export default class GeoJSON {
        static parse(
            obj: any[],
            options?: { Point?: string[]; include?: string[] }
        ): any;
    }
}
