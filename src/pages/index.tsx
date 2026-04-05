import { Box } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { fetchAllPins, fetchAllPinTypes, type Pin, type PinType } from "@/api/pin";
import { fetchPublicAssets } from "@/api/file";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function formatOpeningDays(bits: number): string {
  return DAY_LABELS.map((label, i) => {
    const isOpen = (bits >> i) & 1;
    const color = isOpen ? "#38A169" : "#CBD5E0";
    const fontWeight = isOpen ? "700" : "400";
    return `<span style="display:inline-block;padding:2px 5px;margin:1px;border-radius:4px;font-size:11px;font-weight:${fontWeight};color:${isOpen ? "white" : "#A0AEC0"};background:${color};">${label}</span>`;
  }).join("");
}

function formatTime(t: number[]): string {
  if (!t || t.length < 2) return "";
  return `${String(t[0] % 24).padStart(2, "0")}:${String(t[1]).padStart(2, "0")}`;
}

function buildPopupHTML(pin: Pin, pinType?: PinType): string {
  const bannerImg = pin.image_id
    ? `<img src="${fetchPublicAssets(pin.image_id)}" alt="${pin.name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />`
    : "";

  const sponsoredBadge = pin.is_sponsored
    ? `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;background:#FEFCBF;color:#975A16;margin-left:6px;vertical-align:middle;">⭐ Tài trợ</span>`
    : "";

  const categoryLabel = pinType
    ? `<p style="margin:4px 0 0;font-size:12px;color:#718096;font-weight:500;">${pinType.icon} ${pinType.name}</p>`
    : "";

  const acceptsSection = pin.accepts
    ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">
        ${pin.accepts.split(",").map(a => a.trim()).filter(Boolean).map(a =>
          `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:12px;background:#EDF2F7;color:#2D3748;font-weight:500;">${a}</span>`
        ).join("")}
       </div>`
    : "";

  const daysSection = pin.opening_days != null
    ? `<div style="margin-top:8px;">${formatOpeningDays(pin.opening_days)}</div>`
    : "";

  const timeSection = pin.opening && pin.closing
    ? `<p style="margin:4px 0 0;font-size:12px;color:#4A5568;font-weight:500;">🕐 ${formatTime(pin.opening)} – ${formatTime(pin.closing)}</p>`
    : "";

  const termsSection = pin.terms
    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #EDF2F7;">
        <p style="margin:0;font-size:12px;color:#4A5568;font-weight:600;">Điều khoản</p>
        <p style="margin:2px 0 0;font-size:12px;color:#4A5568;line-height:1.4;">${pin.terms}</p>
       </div>`
    : "";

  const noteSection = pin.note
    ? `<p style="margin:6px 0 0;font-size:12px;color:#4A5568;font-style:italic;line-height:1.4;">📝 ${pin.note}</p>`
    : "";

  return `
    <div style="color:#1A202C;max-width:280px;font-family:system-ui,sans-serif;">
      ${bannerImg}
      <div style="padding:10px 12px 12px;">
        <h3 style="font-weight:700;font-size:15px;margin:0 0 2px;display:inline;color:#1A202C;">${pin.name}</h3>${sponsoredBadge}
        <p style="margin:2px 0 0;font-size:13px;color:#4A5568;">${pin.address}</p>
        ${categoryLabel}
        ${acceptsSection}
        ${daysSection}
        ${timeSection}
        ${termsSection}
        ${noteSection}
      </div>
    </div>
  `;
}

export default function HomePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinTypes, setPinTypes] = useState<PinType[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedPins, fetchedPinTypes] = await Promise.all([
          fetchAllPins(),
          fetchAllPinTypes(),
        ]);
        setPins(fetchedPins);
        setPinTypes(fetchedPinTypes);
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY || "";

    const map = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${VIETMAP_API_KEY}`,
      center: [105.8521, 21.0227],
      zoom: 13,
      maxBounds: [[102.14441, 6.5], [118.0, 23.5]],
      minZoom: 5
    });

    map.on('style.load', () => {
      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
          // Hide all default Point of Interest markers and layers with icons
          if (layer.id.includes('poi') || (layer.layout && layer.layout['icon-image'])) {
            try {
              map.setLayoutProperty(layer.id, 'visibility', 'none');
            } catch (err) {
              // Ignore errors if property can't be set
            }
          }
        });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || pins.length === 0 || pinTypes.length === 0) return;

    // Inject marker styles once via CSS class instead of per-element inline styles
    let styleEl = document.getElementById('midori-marker-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'midori-marker-styles';
      styleEl.textContent = `
        .midori-pin-body {
          width: 36px; height: 36px;
          background: var(--chakra-colors-green-500, #48BB78);
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: -2px 2px 5px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .custom-marker:hover .midori-pin-body {
          transform: rotate(-45deg) scale(1.1);
        }
        .midori-pin-icon {
          transform: rotate(45deg);
          font-size: 20px;
          user-select: none;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }
      `;
      document.head.appendChild(styleEl);
    }

    const markers: vietmapgl.Marker[] = [];
    const pinTypeMap = new Map(pinTypes.map(pt => [pt.id, pt]));

    // Batch marker creation in chunks to avoid blocking the main thread
    const BATCH_SIZE = 50;
    let batchIndex = 0;
    let rafId: number;

    function createBatch() {
      const end = Math.min(batchIndex + BATCH_SIZE, pins.length);
      for (let i = batchIndex; i < end; i++) {
        const pin = pins[i];
        const pinType = pinTypeMap.get(pin.type_id);

        const el = document.createElement('div');
        el.className = 'custom-marker';

        const pinBody = document.createElement('div');
        pinBody.className = 'midori-pin-body';

        const iconElement = document.createElement('div');
        iconElement.className = 'midori-pin-icon';
        iconElement.textContent = pinType?.icon || '🍀';

        pinBody.appendChild(iconElement);
        el.appendChild(pinBody);

        // Lazy popup: only build HTML when the popup is opened
        const popup = new vietmapgl.Popup({ offset: [0, -40], maxWidth: "300px" });
        let popupLoaded = false;
        popup.on('open', () => {
          if (!popupLoaded) {
            popup.setHTML(buildPopupHTML(pin, pinType));
            popupLoaded = true;
          }
        });

        const marker = new vietmapgl.Marker({ element: el })
          .setLngLat([pin.long, pin.lat])
          .setPopup(popup)
          .addTo(map!);

        markers.push(marker);
      }

      batchIndex = end;
      if (batchIndex < pins.length) {
        rafId = requestAnimationFrame(createBatch);
      }
    }

    rafId = requestAnimationFrame(createBatch);

    return () => {
      cancelAnimationFrame(rafId);
      markers.forEach(marker => marker.remove());
    };
  }, [pins, pinTypes]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Navbar />
      <Box flex="1" position="relative">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
      </Box>
    </Box>
  );
}

