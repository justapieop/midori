import { appendPath, BASE_URL } from "./utils";
import authgear from "@authgear/web";
import { challengesCache, userChallengeCache, SINGLE } from "./cache";

const CHALLENGE_API_ENDPOINT: string = appendPath(BASE_URL, "/challenge");
const CHALLENGE_ADMIN_API_ENDPOINT: string = appendPath(BASE_URL, "/admin/challenge");

export async function getAllChallenges(): Promise<Challenge[]> {
    const cached = challengesCache.get(SINGLE);
    if (cached) return cached;

    const challenges: Challenge[] = await (await fetch(CHALLENGE_API_ENDPOINT, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    challengesCache.set(SINGLE, challenges);
    return challenges;
}

export async function createChallenge(data: DTOCreateChallenge): Promise<Challenge> {
    const formData: FormData = new FormData();

    for (let [k, v] of Object.entries(data)) {
        formData.append(k, v);
    }

    const challenge: Challenge = await (await fetch(CHALLENGE_ADMIN_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
        body: formData
    })).json();

    challengesCache.delete(SINGLE);
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

    challengesCache.delete(SINGLE);
}

export async function enrollChallenge(id: string) {
    const enrollEndpoint: string = appendPath(CHALLENGE_API_ENDPOINT, `/${id}`);

    await fetch(enrollEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });

    userChallengeCache.delete(SINGLE);
}

export async function withdrawChallenge(id: string): Promise<void> {
    const withdrawEndpoint: string = appendPath(CHALLENGE_API_ENDPOINT, `/${id}`);

    await fetch(withdrawEndpoint, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });

    userChallengeCache.delete(SINGLE);
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

export async function finishChallenge(id: string): Promise<void> {
    const uploadEndpoint: string = appendPath(CHALLENGE_API_ENDPOINT, `/${id}`);

    await fetch(uploadEndpoint, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });

    userChallengeCache.delete(SINGLE);
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
    created_by: string,
    cover_image: string,
}

export interface UserChallengeLink {
    user_id: string,
    challenge_id: string,
    joined_at: Date,
    finished: boolean,
    finished_at: Date
}

export interface UserChallenge extends UserChallengeLink, Challenge { }

export interface DTOCreateChallenge {
    title: string;
    description: string;
    instruction: string;
    starts_at: string;
    ends_at: string;
    points: number;
    duration: number;
    cover_image: File
}