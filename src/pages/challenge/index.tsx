import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Spinner, Text } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuTrophy } from "react-icons/lu";
import { getAllChallenges, withdrawChallenge, enrollChallenge } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import { fetchImage } from "@/api/file";
import { getCurrentUserChallenge } from "@/api/user";
import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import { ChallengeDetailModal } from "@/components/challenge/ChallengeDetailModal";
import { ChallengeSections } from "@/components/challenge/ChallengeSection";
import { JoinedChallengeBanner } from "@/components/challenge/JoinedChallengeBanner";

export default function ChallengePage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
    const [selected, setSelected] = useState<Challenge | null>(null);
    const [joinedChallenges, setJoinedChallenges] = useState<Challenge[]>([]);

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }

        Promise.all([
            getAllChallenges(),
            getCurrentUserChallenge().catch(() => []),
        ]).then(([data, joined]) => {
                setJoinedChallenges(joined);
                setChallenges(data);
                const toLoad = [...data, ...joined];
                toLoad.forEach((c) => {
                    if (!c.cover_image) return;
                    fetchImage(c.cover_image)
                        .then((buf) => {
                            const blob = new Blob([buf]);
                            const url = URL.createObjectURL(blob);
                            setCoverUrls((prev) => ({ ...prev, [c.id]: url }));
                        })
                        .catch(() => {});
                });
            })
            .finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="gray.50">
                <Spinner size="lg" />
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />

            {/* Hero banner */}
            <Box
                pt={NAVBAR_HEIGHT}
                bgGradient="to-br"
                gradientFrom="green.500"
                gradientTo="teal.400"
                px={{ base: 4, md: 8 }}
            >
                <Flex
                    maxW="1200px"
                    mx="auto"
                    py={10}
                    align="center"
                    gap={4}
                >
                    <Box
                        bg="whiteAlpha.200"
                        borderRadius="xl"
                        p={3}
                        color="white"
                    >
                        <Icon as={LuTrophy} boxSize={7} />
                    </Box>
                    <Box>
                        <Heading size="xl" color="white" fontWeight="bold">
                            Thử thách
                        </Heading>
                        <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                            Tham gia các thử thách để kiếm điểm và nâng cao kỹ năng của bạn.
                        </Text>
                    </Box>
                </Flex>
            </Box>

            <Box
                pt={8}
                pb="2rem"
                px={{ base: 4, md: 8 }}
                maxW="1200px"
                mx="auto"
            >
                {/* Joined challenge banners */}
                {joinedChallenges.map((jc) => (
                    <JoinedChallengeBanner
                        key={jc.id}
                        challenge={jc}
                        coverUrl={coverUrls[jc.id]}
                        onSelect={setSelected}
                    />
                ))}

                {challenges.filter((c) => !joinedChallenges.some((j) => j.id === c.id)).length === 0 && joinedChallenges.length === 0 ? (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        py={20}
                        color="gray.400"
                        gap={3}
                    >
                        <Text fontSize="lg">Chưa có thử thách nào.</Text>
                    </Flex>
                ) : (
                    <ChallengeSections
                        challenges={challenges.filter((c) => !joinedChallenges.some((j) => j.id === c.id))}
                        coverUrls={coverUrls}
                        onSelect={setSelected}
                    />
                )}

                <ChallengeDetailModal
                    challenge={selected}
                    coverUrl={selected ? coverUrls[selected.id] : undefined}
                    joinable={selected ? new Date(selected.starts_at) <= new Date() && new Date() <= new Date(selected.ends_at) : false}
                    isJoined={!!(selected && joinedChallenges.some((j) => j.id === selected.id))}
                    onJoin={async () => {
                        if (!selected) return;
                        try {
                            await enrollChallenge(selected.id);
                            setJoinedChallenges((prev) => [...prev, selected]);
                        } catch {}
                    }}
                    onWithdraw={async () => {
                        if (!selected) return;
                        try {
                            await withdrawChallenge(selected.id);
                            setJoinedChallenges((prev) => prev.filter((c) => c.id !== selected.id));
                        } catch {}
                    }}
                    onClose={() => setSelected(null)}
                />
            </Box>
        </Box>
    );
}
