import { appendPath } from "./utils";

const BASE_S3_URL: string = import.meta.env.VITE_S3_ENDPOINT;

const BASE_PUBLIC_URL: string = appendPath(BASE_S3_URL, "/public");

export function fetchPublicAssets(id: string): string {
    return appendPath(BASE_PUBLIC_URL, `/${id}`);
}

export function fetchUserAssets(userId: string, id: string): string {
    return appendPath(BASE_S3_URL, `/${userId}/${id}`);
}