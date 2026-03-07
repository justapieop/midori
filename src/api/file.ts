import { appendPath, BASE_URL } from "./utils";
import { imageCache } from "./cache";

const FILE_ENDPOINT: string = appendPath(BASE_URL, "/file");

export async function fetchImage(id: string): Promise<ArrayBuffer> {
    const cached = imageCache.get(id);
    if (cached) return cached;

    const file: string = appendPath(FILE_ENDPOINT, `/${id}`);

    const res: ArrayBuffer = await (await fetch(file, {
        method: "GET",
    })).arrayBuffer();

    imageCache.set(id, res);
    return res;
}