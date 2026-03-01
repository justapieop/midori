import { appendPath, BASE_URL } from "./utils";

const FILE_ENDPOINT: string = appendPath(BASE_URL, "/file");

export async function fetchImage(id: string): Promise<ArrayBuffer> {
    const file: string = appendPath(FILE_ENDPOINT, `/${id}`);

    const res: ArrayBuffer = await (await fetch(file, {
        method: "GET",
    })).arrayBuffer();

    return res;
}