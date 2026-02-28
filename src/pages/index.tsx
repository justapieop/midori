import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { Map as VietmapMap, NavigationControl, Marker } from "@vietmap/vietmap-gl-js/dist/vietmap-gl.js";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { useCookies } from "react-cookie";
import authgear from "@authgear/web";
import { createRoot } from "react-dom/client";
import MapMarker from "@/components/maps/MapMarker";
import PinOverlay from "@/components/maps/PinOverlay";
import { Provider } from "@/components/ui/provider";
import { fetchAllPins, fetchAllPinTypes } from "@/api";
import type { Pin as PinData, PinType } from "@/api/pin";

function iconToDataUrl(icon: number[]): string {
    const bytes = new Uint8Array(icon);
    const blob = new Blob([bytes], { type: "image/png" });
    return URL.createObjectURL(blob);
}

export default function Home(): JSX.Element {
    const [cookies, setCookie] = useCookies(["access-token"]);
    const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
    const setSelectedPinRef = useRef(setSelectedPin);
    setSelectedPinRef.current = setSelectedPin;

    useEffect(() => {
        setCookie("access-token", authgear.accessToken, {
            httpOnly: true,
            secure: true
        });
    }, []);

    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<VietmapMap | null>(null);

    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        const map = new VietmapMap({
            container: mapContainer.current,
            style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${import.meta.env.VITE_VIETMAP_API_KEY}`,
            center: [105.8521, 21.0227],
            zoom: 13,
            maxBounds: [[102.14441, 6.5], [118.0, 23.5]],
            minZoom: 5
        }).addControl(new NavigationControl());

        mapRef.current = map;

        map.on("load", async () => {
            const [pins, types]: [PinData[], PinType[]] = await Promise.all([
                fetchAllPins(),
                fetchAllPinTypes(),
            ]);

            const typeIconMap: Record<string, string> = {};
            for (const type of types) {
                typeIconMap[type.id] = iconToDataUrl(type.icon);
            }

            for (const pin of pins) {
                const el = document.createElement("div");
                el.style.cursor = "pointer";
                el.addEventListener("click", () => setSelectedPinRef.current(pin));
                const root = createRoot(el);
                root.render(
                    <Provider>
                        <MapMarker iconSrc={typeIconMap[pin.type_id]} />
                    </Provider>
                );

                new Marker({ element: el })
                    .setLngLat([pin.long, pin.lat])
                    .addTo(map);
            }
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <>
            <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
            {selectedPin && (
                <PinOverlay pin={selectedPin} onClose={() => setSelectedPin(null)} />
            )}
        </>
    );
}