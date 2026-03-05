import type { JSX } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import type { Challenge } from "@/api/challenge";
import { ChallengeGrid } from "./ChallengeGrid";

export function ChallengeSection({
    title,
    dot,
    challenges,
    coverUrls,
    clickable,
    onSelect,
}: {
    title: string;
    dot: string;
    challenges: Challenge[];
    coverUrls: Record<string, string>;
    clickable: boolean;
    onSelect: (c: Challenge) => void;
}): JSX.Element | null {
    if (challenges.length === 0) return null;
    return (
        <Box mb={12}>
            <Flex align="center" gap={3} mb={5}>
                <Box w={3} h={3} borderRadius="full" bg={dot} flexShrink={0} />
                <Heading size="md" color="gray.800">{title}</Heading>
                <Box flex={1} h="1px" bg="gray.200" />
                <Text fontSize="sm" color="gray.400" fontWeight="medium">
                    {challenges.length} thử thách
                </Text>
            </Flex>
            <ChallengeGrid challenges={challenges} coverUrls={coverUrls} clickable={clickable} onSelect={onSelect} />
        </Box>
    );
}

export function ChallengeSections({
    challenges,
    coverUrls,
    onSelect,
}: {
    challenges: Challenge[];
    coverUrls: Record<string, string>;
    onSelect: (c: Challenge) => void;
}): JSX.Element {
    const now = new Date();
    const active = challenges.filter((c) => new Date(c.starts_at) <= now && now <= new Date(c.ends_at));
    const upcoming = challenges.filter((c) => new Date(c.starts_at) > now);
    const ended = challenges.filter((c) => new Date(c.ends_at) < now);
    return (
        <Box>
            <ChallengeSection title="Đang diễn ra" dot="green.400" challenges={active} coverUrls={coverUrls} clickable onSelect={onSelect} />
            <ChallengeSection title="Sắp diễn ra" dot="blue.400" challenges={upcoming} coverUrls={coverUrls} clickable onSelect={onSelect} />
            <ChallengeSection title="Đã kết thúc" dot="gray.400" challenges={ended} coverUrls={coverUrls} clickable={false} onSelect={onSelect} />
        </Box>
    );
}
