import { appendPath, BASE_URL } from "./utils";
import { postsCache, postCache, postAttachmentsCache } from "./cache";
import authgear from "@authgear/web";

const POST_ENDPOINT: string = appendPath(BASE_URL, "/post");

export async function getAllPosts(limit: number, page: number): Promise<GetAllPostResponse> {
    const key = `${limit}:${page}`;
    const cached = postsCache.get(key);
    if (cached) return cached;

    const endpoint: string = `${POST_ENDPOINT}?limit=${limit}&page=${page}`;
    const data: GetAllPostResponse = await (await fetch(endpoint,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authgear.accessToken}`,
            }
        })).json();
    postsCache.set(key, data);
    return data;
}

export async function getPost(id: string): Promise<Post> {
    const cached = postCache.get(id);
    if (cached) return cached;

    const endpoint: string = `${POST_ENDPOINT}/${id}`;
    const data: Post = await (await fetch(endpoint,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authgear.accessToken}`,
            }
        })).json();
    postCache.set(id, data);
    return data;
}

export async function createPost(input: DTOCreatePost): Promise<void> {
    const formData: FormData = new FormData();

    formData.append("content", input.content);
    for (const attachment of (input.attachments ?? [])) {
        formData.append("attachments", attachment);
    }

    const post: Post = await (await fetch(POST_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
        body: formData,
    })).json();

    postsCache.clear();
    postCache.set(post.id, post);
}

export async function getPostAttachments(id: string): Promise<string[]> {
    const cached = postAttachmentsCache.get(id);
    if (cached) return cached;

    const endpoint: string = appendPath(POST_ENDPOINT, `/${id}/attachment`);
    const data: string[] = await (await fetch(endpoint, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authgear.accessToken}`,
        },
    })).json();

    postAttachmentsCache.set(id, data);
    return data;
}

export interface DTOCreatePost {
    content: string,
    attachments?: File[],
}

export interface GetAllPostResponse {
    page: number,
    limit: number,
    posts: Post[],
}

export interface Post {
    id: string,
    author: string,
    created_at: Date,
    updated_at: Date,
    content: string,
    likes: number,
}