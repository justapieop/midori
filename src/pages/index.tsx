import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { Map as VietmapMap, NavigationControl, Marker } from "@vietmap/vietmap-gl-js/dist/vietmap-gl.js";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { createRoot } from "react-dom/client";
import { LuMap } from "react-icons/lu";
import MapMarker from "@/components/maps/MapMarker";
import PinOverlay from "@/components/maps/PinOverlay";
import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import { Provider } from "@/components/ui/provider";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { fetchAllPins, fetchAllPinTypes } from "@/api";
import type { Pin as PinData, PinType } from "@/api/pin";

function iconToDataUrl(icon: number[]): string {
    const bytes = new Uint8Array(icon);
    const blob = new Blob([bytes], { type: "image/png" });
    return URL.createObjectURL(blob);
}

export default function Home(): JSX.Element {
    const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
    const [loading, setLoading] = useState(true);
    const setSelectedPinRef = useRef(setSelectedPin);
    setSelectedPinRef.current = setSelectedPin;

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

            setLoading(false);
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <>
            <Navbar />
            <div
                ref={mapContainer}
                style={{
                    position: "fixed",
                    top: NAVBAR_HEIGHT,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            />
            {loading && (
                <LoadingScreen
                    icon={LuMap}
                    message="Đang tải bản đồ..."
                    variant="fixed"
                    top={NAVBAR_HEIGHT}
                />
            )}
            {selectedPin && (
                <PinOverlay pin={selectedPin} onClose={() => setSelectedPin(null)} />
            )}
        </>
    );
}