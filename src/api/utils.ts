export const BASE_URL: string = import.meta.env.VITE_BACKEND_API_ENDPOINT;

export function appendPath(pathA: string, path: string): string {
    let url: string = pathA.trim();

    if (!url.endsWith("/")) {
        url += "/"
    }

    let trimmedPath: string = path.trim();

    while (trimmedPath.startsWith("/")) {
        trimmedPath = trimmedPath.replace("/", "");
    }

    url += trimmedPath;

    return url;
}