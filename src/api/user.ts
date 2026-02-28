import type { UserInfo } from "@authgear/web";
import authgear from "@authgear/web";
import { appendPath, BASE_URL } from "./utils";

const USER_API_ENDPOINT: string = appendPath(BASE_URL, "/user");

export async function fetchUserProfile(): Promise<UserProfile> {
    const data: UserInfo = await authgear.fetchUserInfo();

    const mePath: string = appendPath(USER_API_ENDPOINT, "/me");

    const fetchedData: PartialUserProfile = await (await fetch(mePath, {
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

interface PartialUserProfile {
    id: string
    created_at: string;
    updated_at: string;
    bio: string;
    is_admin: boolean;
    points: number;
}

export interface UserProfile extends UserInfo, PartialUserProfile { }