import { LRUCache } from "lru-cache";
import type { Challenge, UserChallenge, UserChallengeLink } from "./challenge";
import type { Pin, PinType } from "./pin";
import type { UserProfile, UserUploads } from "./user";

const TTL_SHORT: number = 2 * 60 * 1000;
const TTL_LONG: number = 5 * 60 * 1000;
const TTL_IMAGE: number = 10 * 60 * 1000;

export const SINGLE: string = "v";

export const challengesCache: LRUCache<string, Challenge[]> = new LRUCache({ max: 1, ttl: TTL_LONG });
export const pinsCache: LRUCache<string, Pin[]> = new LRUCache({ max: 1, ttl: TTL_LONG });
export const pinTypesCache: LRUCache<string, PinType[]> = new LRUCache({ max: 1, ttl: TTL_LONG });
export const userProfileCache: LRUCache<string, UserProfile> = new LRUCache({ max: 1, ttl: TTL_SHORT });
export const userChallengeCache: LRUCache<string, UserChallenge> = new LRUCache({ max: 1, ttl: TTL_SHORT });
export const userChallengeLinkCache: LRUCache<string, UserChallengeLink> = new LRUCache({ max: 1, ttl: TTL_SHORT });
export const imageCache: LRUCache<string, ArrayBuffer> = new LRUCache({ max: 100, ttl: TTL_IMAGE });
export const userUploadsCache: LRUCache<string, UserUploads[]> = new LRUCache({ max: 20, ttl: TTL_SHORT });
