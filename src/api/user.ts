import authgear from "@authgear/web";
import { appendPath, BASE_URL } from "./utils";
import type { Challenge, UserChallenge, UserChallengeLink } from "./challenge";
import { userProfileCache, userChallengeCache, userChallengeLinkCache, userUploadsCache, userByIdCache, SINGLE } from "./cache";
import { getAllChallenges } from "./challenge";

const USER_API_ENDPOINT: string = appendPath(BASE_URL, "/user");

export async function fetchUserProfile(): Promise<UserProfile> {
    const cached = userProfileCache.get(SINGLE);
    if (cached) return cached;


    const fetchedData: UserProfile = await (await fetch(USER_API_ENDPOINT, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    userProfileCache.set(SINGLE, fetchedData);
    return fetchedData;
}

export async function getCurrentUserChallenge(): Promise<UserChallenge | null> {
    const cached = userChallengeCache.get(SINGLE);
    if (cached) return cached;

    const path: string = appendPath(USER_API_ENDPOINT, `/challenge`);

    const res = await fetch(path, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });

    if (!res.ok) return null;

    const fetchedData: UserChallengeLink = await res.json();
    const fetchedChallenge: Challenge[] = (await getAllChallenges()).filter((f) => f.id === fetchedData.challenge_id);
    if (fetchedChallenge.length === 0) {
        return null;
    }

    userChallengeLinkCache.set(SINGLE, fetchedData);
    const userChallenge: UserChallenge = { ...fetchedData, ...fetchedChallenge[0] };
    userChallengeCache.set(SINGLE, userChallenge);
    return userChallenge;
}

export async function updateBio(bio: string): Promise<void> {
    await fetch(`${USER_API_ENDPOINT}?bio_value=${bio}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });

    userProfileCache.delete(SINGLE);
}

export async function getCurrentChallengeUserUploads(id: string): Promise<UserUploads[]> {
    const cached = userUploadsCache.get(id);
    if (cached) return cached;

    const path: string = appendPath(USER_API_ENDPOINT, `/challenge/gallery`);

    const fetchedData: UserUploads[] = await (await fetch(path, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();
    userUploadsCache.set(id, fetchedData);
    return fetchedData;
}

export async function getUserById(id: string): Promise<UserProfile> {
    const cached = userByIdCache.get(id);
    if (cached) return cached;

    const path: string = appendPath(USER_API_ENDPOINT, `/${id}`);

    const fetchedData: UserProfile = await (await fetch(path, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    userByIdCache.set(id, fetchedData);
    return fetchedData;
}

export interface UserProfile {
    id: string,
    created_at: string,
    updated_at: string,
    bio: string,
    is_admin: boolean,
    points: number,
    email: string,
    name: string,
    avatar_url: string,
}

export interface UserUploads {
    challenge_id: string,
    content: Uint8Array,
    created_at: Date,
}