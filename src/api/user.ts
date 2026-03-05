import type { UserInfo } from "@authgear/web";
import authgear from "@authgear/web";
import { appendPath, BASE_URL } from "./utils";
import type { Challenge } from "./challenge";

const USER_API_ENDPOINT: string = appendPath(BASE_URL, "/user");

export async function fetchUserProfile(): Promise<UserProfile> {
    const data: UserInfo = await authgear.fetchUserInfo();

    const fetchedData: PartialUserProfile = await (await fetch(USER_API_ENDPOINT, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    return {
        ...data,
        ...fetchedData
    }
}

export async function getCurrentUserChallenge(): Promise<Challenge[]> {
    const path: string = appendPath(USER_API_ENDPOINT, `/challenge`);

    const fetchedData: Challenge[] = await (await fetch(path, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    return fetchedData;
}

export async function updateBio(bio: string): Promise<void> {
    await fetch(`${USER_API_ENDPOINT}?bio_value=${bio}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    });
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