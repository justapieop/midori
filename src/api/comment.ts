import { commentByPostId, replyByCommentId } from "./cache";
import { POST_ENDPOINT } from "./post";
import authgear from "@authgear/web";

export async function fetchPostComment(postId: string, limit: number, page: number): Promise<GetAllCommentResponse> {
    const key = `${postId}:${limit}:${page}`;
    let cached = commentByPostId.get(key)
    if (cached) {
        return cached;
    }

    const endpoint = `${POST_ENDPOINT}/${postId}/comment?limit=${limit}&page=${page}`;
    let comment: GetAllCommentResponse = await (await authgear.fetch(endpoint, {
        method: "GET",
    })).json();

    commentByPostId.set(key, comment);

    return comment;
}

export async function fetchReplyFromComment(postId: string, id: string, limit: number, page: number): Promise<GetAllCommentResponse> {
    const key = `${id}:${limit}:${page}`;
    let cached = replyByCommentId.get(key)
    if (cached) {
        return cached;
    }

    const endpoint = `${POST_ENDPOINT}/${postId}/comment/${id}?limit=${limit}&page=${page}`;
    let response: GetAllCommentResponse = await (await authgear.fetch(endpoint, {
        method: "GET",
    })).json();

    replyByCommentId.set(key, response);

    return response;
}

export async function createComment(postId: string, payload: DTOCreateComment): Promise<Comment> {
    const endpoint = `${POST_ENDPOINT}/${postId}/comment`;

    const formData = new FormData();
    formData.append("content", payload.content);
    if (payload.reply_to) {
        formData.append("reply_to", payload.reply_to);
    }
    if (payload.attachment && payload.attachment.length > 0) {
        formData.append("attachment", new Blob([payload.attachment.buffer as ArrayBuffer]));
    }

    let response = await authgear.fetch(endpoint, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("Failed to create comment");
    }

    return await response.json();
}

export async function createReply(postId: string, payload: DTOCreateComment): Promise<Comment> {
    const endpoint = `${POST_ENDPOINT}/${postId}/comment`;

    const formData = new FormData();
    formData.append("content", payload.content);
    if (payload.reply_to) {
        formData.append("reply_to", payload.reply_to);
    }
    if (payload.attachment && payload.attachment.length > 0) {
        formData.append("attachment", new Blob([payload.attachment.buffer as ArrayBuffer]));
    }

    let response = await authgear.fetch(endpoint, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("Failed to create reply");
    }

    return await response.json();
}

export interface DTOCreateComment {
    content: string,
    attachment: Uint8Array,
    reply_to: string | null,
}

export interface GetAllCommentResponse {
    page: number,
    limit: number,
    comments: Comment[],
}

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    reply_to?: string | null;
    content: string;
    attachment_id?: string | null;
}

