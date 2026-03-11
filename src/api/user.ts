import type { UserInfo } from "@authgear/web";
import authgear from "@authgear/web";
import { appendPath, BASE_URL } from "./utils";
import type { Challenge, UserChallenge, UserChallengeLink } from "./challenge";
import { userProfileCache, userChallengeCache, userChallengeLinkCache, userUploadsCache, SINGLE } from "./cache";
import { getAllChallenges } from "./challenge";

const USER_API_ENDPOINT: string = appendPath(BASE_URL, "/user");

export async function fetchUserProfile(): Promise<UserProfile> {
    const cached = userProfileCache.get(SINGLE);
    if (cached) return cached;

    const data: UserInfo = await authgear.fetchUserInfo();

    const fetchedData: PartialUserProfile = await (await fetch(USER_API_ENDPOINT, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    const profile = { ...data, ...fetchedData };
    userProfileCache.set(SINGLE, profile);
    return profile;
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

interface PartialUserProfile {
    id: string
    created_at: string;
    updated_at: string;
    bio: string;
    is_admin: boolean;
    points: number;
}

export interface UserProfile extends UserInfo, PartialUserProfile { }

export interface UserUploads {
    challenge_id: string,
    content: Uint8Array,
    created_at: Date,
}