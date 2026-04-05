import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Image, Text } from "@chakra-ui/react";
import { LuCalendar, LuClock, LuStar, LuTrophy } from "react-icons/lu";
import type { Challenge } from "@/api/challenge";
import { StatChip } from "./StatChip";

export function ChallengeCard({
    challenge,
    coverUrl,
    clickable,
    onSelect,
}: {
    challenge: Challenge;
    coverUrl?: string;
    clickable: boolean;
    onSelect: (c: Challenge) => void;
}): JSX.Element {
    const start = new Date(challenge.starts_at).toLocaleDateString("vi-VN");
    const end = new Date(challenge.ends_at).toLocaleDateString("vi-VN");

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            cursor={clickable ? "pointer" : "default"}
            opacity={clickable ? 1 : 0.5}
            _hover={clickable ? { boxShadow: "lg", borderColor: "green.300", transform: "translateY(-3px)" } : {}}
            transition="all 0.2s ease"
            onClick={clickable ? () => onSelect(challenge) : undefined}
            position="relative"
        >
            {clickable && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="3px"
                    bgGradient="to-r"
                    gradientFrom="green.400"
                    gradientTo="teal.400"
                    zIndex={1}
                />
            )}

            <Box position="relative">
                {coverUrl ? (
                    <Image src={coverUrl} alt={challenge.title} w="100%" h="175px" objectFit="cover" />
                ) : (
                    <Flex w="100%" h="175px" bg="gray.100" align="center" justify="center" color="gray.300">
                        <Icon as={LuTrophy} boxSize={10} />
                    </Flex>
                )}
                <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="60px"
                    bgGradient="to-t"
                    gradientFrom="blackAlpha.300"
                    gradientTo="transparent"
                />
            </Box>

            <Box p={5}>
                <Heading size="sm" mb={1.5} color="gray.900" lineClamp={2} fontWeight="semibold">
                    {challenge.title}
                </Heading>
                <Text fontSize="sm" color="gray.500" mb={4} lineClamp={2} lineHeight="tall">
                    {challenge.description}
                </Text>
                <Flex gap={2} flexWrap="wrap">
                    <StatChip icon={<LuStar />} label={`${challenge.points} điểm`} />
                    <StatChip icon={<LuClock />} label={`${challenge.duration} ngày`} />
                    <StatChip icon={<LuCalendar />} label={`${start} – ${end}`} />
                </Flex>
            </Box>
        </Box>
    );
}
