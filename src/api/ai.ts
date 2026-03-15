import { appendPath, BASE_URL } from "./utils";
import authgear from "@authgear/web";

const AI_ENDPOINT: string = appendPath(BASE_URL, "/ai");

export async function prompt(input: DTOAiPrompt): Promise<AiResponse> {
    let imageEndpoint: string = appendPath(AI_ENDPOINT, "/image");
    let formData: FormData = new FormData();

    formData.append("prompt", input.prompt);
    formData.append("attachment", input.attachment);

    let res = await authgear.fetch(imageEndpoint, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error();
    }

    let data: AiResponse = await res.json();

    return data;
}


export async function promptText(input: string): Promise<AiResponse> {
    let textEndpoint: string = appendPath(AI_ENDPOINT, `/text?prompt=${encodeURIComponent(input)}`);

    let res = await authgear.fetch(textEndpoint, {
        method: "GET",
    });

    if (!res.ok) {
        throw new Error();
    }

    let data: AiResponse = await res.json();

    return data;
}

export enum PromptPreset {
    Vegetarian = "Based on the attached image, tell me what vegetarian-friendly meals can I do with these ingredient. VERY IMPORTANT: The final response you output must be entirely in Vietnamese language. Do not output English. Include links to recipe. Write the response in markdown.",
    Recycle = "Based on the attached image, tell me how can I categorize these garbage. VERY IMPORTANT: The final response you output must be entirely in Vietnamese language. Do not output English. Write the response in markdown.",
}

export interface DTOAiPrompt {
    prompt: string,
    attachment: File
}

export interface AiResponse {
    thought: string,
    content: string,
}