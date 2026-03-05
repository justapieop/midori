import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Image, Text } from "@chakra-ui/react";
import { LuCalendar, LuCircleCheck, LuClock, LuStar, LuTrophy } from "react-icons/lu";
import type { Challenge } from "@/api/challenge";
import { StatChip } from "./StatChip";

export function JoinedChallengeBanner({
    challenge,
    coverUrl,
    onSelect,
}: {
    challenge: Challenge;
    coverUrl?: string;
    onSelect: (c: Challenge) => void;
}): JSX.Element {
    return (
        <Box
            mb={10}
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="md"
            border="1px solid"
            borderColor="green.200"
            cursor="pointer"
            onClick={() => onSelect(challenge)}
            _hover={{ boxShadow: "lg" }}
            transition="all 0.2s ease"
            position="relative"
        >
            <Box h="4px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
            <Flex
                bg="green.50"
                px={6}
                py={4}
                align="center"
                gap={2}
                borderBottom="1px solid"
                borderColor="green.100"
            >
                <Icon as={LuCircleCheck} color="green.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                    Thử thách đang tham gia
                </Text>
            </Flex>
            <Flex bg="white" gap={0} direction={{ base: "column", md: "row" }}>
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={challenge.title}
                        w={{ base: "100%", md: "260px" }}
                        h={{ base: "160px", md: "auto" }}
                        objectFit="cover"
                        flexShrink={0}
                    />
                ) : (
                    <Flex
                        w={{ base: "100%", md: "260px" }}
                        h={{ base: "120px", md: "auto" }}
                        bg="gray.100"
                        align="center"
                        justify="center"
                        color="gray.300"
                        flexShrink={0}
                    >
                        <Icon as={LuTrophy} boxSize={10} />
                    </Flex>
                )}
                <Box p={6}>
                    <Heading size="md" color="gray.900" mb={2}>{challenge.title}</Heading>
                    <Text fontSize="sm" color="gray.500" mb={4} lineHeight="tall" lineClamp={2}>
                        {challenge.description}
                    </Text>
                    <Flex gap={2} flexWrap="wrap">
                        <StatChip icon={<LuStar />} label={`${challenge.points} điểm`} />
                        <StatChip icon={<LuClock />} label={`${challenge.duration} ngày`} />
                        <StatChip
                            icon={<LuCalendar />}
                            label={`${new Date(challenge.starts_at).toLocaleDateString("vi-VN")} – ${new Date(challenge.ends_at).toLocaleDateString("vi-VN")}`}
                        />
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
}
