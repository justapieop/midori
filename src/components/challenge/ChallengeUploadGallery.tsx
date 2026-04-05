import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Icon, Spinner, Text } from "@chakra-ui/react";
import { LuCalendarDays, LuImages } from "react-icons/lu";
import { getCurrentChallengeUserUploads } from "@/api/user";
import type { UserUploads } from "@/api/user";
import { userUploadsCache } from "@/api/cache";
import { generateDateRange } from "./gallery/types";
import type { DateGroup, GalleryEntry } from "./gallery/types";
import { Lightbox } from "./gallery/Lightbox";
import { GalleryDateGroup } from "./gallery/GalleryDateGroup";

interface ChallengeUploadGalleryProps {
    challengeId: string;
    refreshKey?: number;
    joinedAt: Date;
    endsAt: Date;
}

export function ChallengeUploadGallery({ challengeId, refreshKey = 0, joinedAt, endsAt }: ChallengeUploadGalleryProps): JSX.Element {
    const [groups, setGroups] = useState<DateGroup[]>([]);
    const [allEntries, setAllEntries] = useState<GalleryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const blobUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        // Revoke previous blob URLs
        blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        blobUrlsRef.current = [];

        setLoading(true);
        // Invalidate cache on each refresh so new uploads show up
        if (refreshKey > 0) userUploadsCache.delete(challengeId);

        getCurrentChallengeUserUploads(challengeId)
            .then((uploads: UserUploads[]) => {
                const sorted = [...uploads].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                const entries: GalleryEntry[] = sorted.map((u) => {
                    const bytes = u.content instanceof Uint8Array
                        ? u.content
                        : new Uint8Array(Object.values(u.content as unknown as Record<string, number>));
                    const blob = new Blob([bytes.slice(0)]);
                    const url = URL.createObjectURL(blob);
                    blobUrlsRef.current.push(url);
                    return { url, createdAt: new Date(u.created_at) };
                });
                setAllEntries(entries);
                setGroups(generateDateRange(new Date(joinedAt), new Date(endsAt), entries));
            })
            .catch(() => {
                setGroups([]);
                setAllEntries([]);
            })
            .finally(() => setLoading(false));

        return () => {
            blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
            blobUrlsRef.current = [];
        };
    }, [challengeId, refreshKey]);

    if (loading) {
        return (
            <Box
                mb={10}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                overflow="hidden"
                boxShadow="sm"
            >
                <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
                <Flex px={6} py={8} justify="center" align="center" gap={3}>
                    <Spinner size="sm" color="green.500" />
                    <Text fontSize="sm" color="gray.500">Đang tải ảnh...</Text>
                </Flex>
            </Box>
        );
    }

    if (groups.length === 0) {
        return (
            <Box
                mb={10}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                overflow="hidden"
                boxShadow="sm"
            >
                <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
                <Flex px={6} py={8} direction="column" align="center" gap={2} color="gray.400">
                    <Icon as={LuImages} boxSize={8} />
                    <Text fontSize="sm">Bạn chưa tải lên ảnh nào cho thử thách này.</Text>
                </Flex>
            </Box>
        );
    }

    return (
        <>
            <Box
                mb={10}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                overflow="hidden"
                boxShadow="sm"
            >
                <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />

                <Box px={6} py={5}>
                    <Flex align="center" gap={2} mb={5}>
                        <Icon as={LuCalendarDays} boxSize={4} color="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                            Ảnh đã tải lên
                        </Text>
                        <Text fontSize="xs" color="gray.400" ml={1}>
                            ({allEntries.length} ảnh)
                        </Text>
                    </Flex>

                    <Box overflowX="auto" pb={3}>
                        <Flex gap={3} minW="max-content">
                            {groups.map((group) => (
                                <GalleryDateGroup
                                    key={group.label}
                                    group={group}
                                    allEntries={allEntries}
                                    onImageClick={setLightboxIndex}
                                />
                            ))}
                        </Flex>
                    </Box>
                </Box>
            </Box>

            {lightboxIndex !== null && (
                <Lightbox
                    entries={allEntries}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                    onNext={() => setLightboxIndex((i) => (i !== null && i < allEntries.length - 1 ? i + 1 : i))}
                />
            )}
        </>
    );
}
