import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Image, Stack, Text } from "@chakra-ui/react";
import { LuCalendar, LuClock, LuStar, LuTrophy } from "react-icons/lu";
import type { Challenge } from "@/api/challenge";

interface JoinedChallengeCardProps {
    challenge: Challenge;
    coverUrl?: string;
}

export function JoinedChallengeCard({ challenge, coverUrl }: JoinedChallengeCardProps): JSX.Element {
    return (
        <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="green.200"
            overflow="hidden"
            mb={6}
        >
            <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
            <Flex
                bg="green.50"
                px={6}
                py={3}
                align="center"
                gap={2}
                borderBottom="1px solid"
                borderColor="green.100"
            >
                <Icon as={LuTrophy} color="green.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                    Thử thách đang tham gia
                </Text>
            </Flex>
            <Flex direction={{ base: "column", sm: "row" }}>
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={challenge.title}
                        w={{ base: "100%", sm: "200px" }}
                        h={{ base: "140px", sm: "auto" }}
                        objectFit="cover"
                        flexShrink={0}
                    />
                ) : (
                    <Flex
                        w={{ base: "100%", sm: "200px" }}
                        h={{ base: "120px", sm: "auto" }}
                        bg="gray.100"
                        align="center"
                        justify="center"
                        color="gray.300"
                        flexShrink={0}
                    >
                        <Icon as={LuTrophy} boxSize={8} />
                    </Flex>
                )}
                <Box p={5}>
                    <Heading size="sm" color="gray.900" mb={1}>{challenge.title}</Heading>
                    <Text fontSize="sm" color="gray.500" mb={3} lineHeight="tall" lineClamp={2}>
                        {challenge.description}
                    </Text>
                    <Stack gap={1}>
                        <Flex align="center" gap={2} fontSize="xs" color="gray.500">
                            <LuStar />
                            <Text>{challenge.points} điểm</Text>
                        </Flex>
                        <Flex align="center" gap={2} fontSize="xs" color="gray.500">
                            <LuClock />
                            <Text>{challenge.duration} ngày</Text>
                        </Flex>
                        <Flex align="center" gap={2} fontSize="xs" color="gray.500">
                            <LuCalendar />
                            <Text>
                                {new Date(challenge.starts_at).toLocaleDateString("vi-VN")} – {new Date(challenge.ends_at).toLocaleDateString("vi-VN")}
                            </Text>
                        </Flex>
                    </Stack>
                </Box>
            </Flex>
        </Box>
    );
}
