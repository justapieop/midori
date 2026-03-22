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

export async function deletePinType(id: string): Promise<void> {
    const endpoint: string = appendPath(BASE_URL, `/type/${id}`);
    const res: Response = await authgear.fetch(endpoint, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("failed to delete pin type");
    }

    pinsCache.clear();
    pinTypesCache.clear();
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
    name: string,
    icon: string,
}

export interface DTOCreatePin {
    name: string,
    lat: number,
    long: number,
    address: string,
    is_sponsored: boolean,
    terms: string,
    opening: [number, number],
    closing: [number, number],
    instruction: string,
    accepts: string,
    image: File,
    opening_days: number,
    note: string,
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

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("lat", data.lat.toString());
    formData.append("long", data.long.toString());
    formData.append("address", data.address);
    formData.append("is_sponsored", data.is_sponsored.toString());
    formData.append("terms", data.terms);
    formData.append("opening", JSON.stringify(data.opening));
    formData.append("closing", JSON.stringify(data.closing));
    formData.append("instruction", data.instruction);
    formData.append("accepts", data.accepts);
    formData.append("image", data.image);
    formData.append("opening_days", data.opening_days.toString());

    const res: Pin = await (await fetch(pinApiEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
        body: formData,
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
    image_id: string,
    accepts: string,
    opening_days: number,
    note: string,
}