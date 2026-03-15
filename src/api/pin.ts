import { appendPath, BASE_URL } from "./utils";
import { pinsCache, pinTypesCache, SINGLE } from "./cache";
import authgear from "@authgear/web";

const PIN_API_ENDPOINT: string = appendPath(BASE_URL, "/pin");
const PIN_ADMIN_API_ENDPOINT: string = appendPath(BASE_URL, "/admin/pin");

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

export interface DTOCreatePinType {
    name: string;
    icon: string;
}

export interface DTOCreatePin {
    name: string;
    lat: number;
    long: number;
    address: string;
    is_sponsored: boolean;
    terms: string;
    opening: [number, number];
    closing: [number, number];
    instruction: string;
}

export async function createPinType(data: DTOCreatePinType): Promise<PinType> {
    const pinTypesApiEndpoint: string = appendPath(PIN_ADMIN_API_ENDPOINT, "/type");
    const res: PinType = await (await fetch(pinTypesApiEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })).json();

    pinTypesCache.delete(SINGLE);
    return res;
}

export async function createPin(typeId: string, data: DTOCreatePin): Promise<Pin> {
    const pinApiEndpoint: string = appendPath(PIN_ADMIN_API_ENDPOINT, `/type/${typeId}`);
    const res: Pin = await (await fetch(pinApiEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })).json();

    pinsCache.delete(SINGLE);
    return res;
}

export interface PinType {
    id: string;
    name: string;
    icon: string;
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