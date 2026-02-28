import { appendPath, BASE_URL } from "./utils";

const PIN_API_ENDPOINT: string = appendPath(BASE_URL, "/pin");

export async function fetchAllPins(): Promise<Pin[]> {
    const res: Pin[] = await (await fetch(PIN_API_ENDPOINT, {
        method: "GET",
    })).json();

    return res;
}

export async function fetchAllPinTypes(): Promise<PinType[]> {
    const pinTypesApiEndpoint: string = appendPath(PIN_API_ENDPOINT, "/type");
    const res: PinType[] = await (await fetch(pinTypesApiEndpoint, {
        method: "GET",
    })).json();

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