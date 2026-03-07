import { appendPath, BASE_URL } from "./utils";
import { pinsCache, pinTypesCache, SINGLE } from "./cache";

const PIN_API_ENDPOINT: string = appendPath(BASE_URL, "/pin");

export async function fetchAllPins(): Promise<Pin[]> {
    const cached = pinsCache.get(SINGLE);
    if (cached) return cached;

    const res: Pin[] = await (await fetch(PIN_API_ENDPOINT, {
        method: "GET",
    })).json();

    pinsCache.set(SINGLE, res);
    return res;
}

export async function fetchAllPinTypes(): Promise<PinType[]> {
    const cached = pinTypesCache.get(SINGLE);
    if (cached) return cached;

    const pinTypesApiEndpoint: string = appendPath(PIN_API_ENDPOINT, "/type");
    const res: PinType[] = await (await fetch(pinTypesApiEndpoint, {
        method: "GET",
    })).json();

    pinTypesCache.set(SINGLE, res);
    return res;
}

export interface PinType {
    id: string;
    name: string;
    icon: number[];
}

export interface Pin {
    id: string;
    name: string;
    type_id: string;
    lat: number;
    long: number;
    created_at: string;
    updated_at: string;
    address: string;
    is_sponsored: boolean;
    terms: string;
    opening: number[];
    closing: number[];
}