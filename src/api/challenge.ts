import { appendPath, BASE_URL } from "./utils";
import authgear from "@authgear/web";

const CHALLENGE_API_ENDPOINT: string = appendPath(BASE_URL, "/challenge");
const CHALLENGE_ADMIN_API_ENDPOINT: string = appendPath(BASE_URL, "/admin/challenge");

export async function getAllChallenges(): Promise<Challenge[]> {
    const challenges: Challenge[] = await (await fetch(CHALLENGE_API_ENDPOINT, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    return challenges;
}

export async function createChallenge(data: DTOCreateChallenge): Promise<Challenge> {
    const challenge: Challenge = await (await fetch(CHALLENGE_ADMIN_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })).json();

    return challenge;
}

export async function deleteChallenge(id: string): Promise<void> {
    const deleteChallengeEndpoint: string = appendPath(CHALLENGE_ADMIN_API_ENDPOINT, `/${id}`);

    await fetch(deleteChallengeEndpoint, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });
}

export async function enrollChallenge(id: string) {
    const enrollEndpoint: string = appendPath(CHALLENGE_API_ENDPOINT, `/${id}`);

    await fetch(enrollEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });
}

export async function uploadChallenge(id: string, file: File): Promise<void> {
    const uploadEndpoint: string = appendPath(CHALLENGE_API_ENDPOINT, `/${id}`);

    const formData: FormData = new FormData();

    formData.append("attachment", file);

    await fetch(uploadEndpoint, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
        body: formData,
    });
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    instruction: string;
    created_at: Date;
    updated_at: Date;
    starts_at: Date;
    ends_at: Date;
    points: number;
    duration: number;
}

export interface DTOCreateChallenge {
    title: string;
    description: string;
    instruction: string;
    starts_at: string;
    ends_at: string;
    points: number;
    duration: number;
}