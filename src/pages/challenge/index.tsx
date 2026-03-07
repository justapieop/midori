import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuTrophy } from "react-icons/lu";
import { getAllChallenges, withdrawChallenge, enrollChallenge, finishChallenge } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import { fetchImage } from "@/api/file";
import { getCurrentUserChallenge } from "@/api/user";
import Navbar from "@/components/Navbar";
import { ChallengeDetailModal } from "@/components/challenge/ChallengeDetailModal";
import { ChallengeHeroBanner } from "@/components/challenge/ChallengeHeroBanner";
import { ChallengeSections } from "@/components/challenge/ChallengeSection";
import { JoinedChallengeBanner } from "@/components/challenge/JoinedChallengeBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

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
        return <LoadingScreen icon={LuTrophy} message="Đang tải thử thách..." />
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />

            <ChallengeHeroBanner />

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

                {joinedChallenges.length === 0 && challenges.length === 0 ? (
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
                ) : joinedChallenges.length === 0 ? (
                    <ChallengeSections
                        challenges={challenges}
                        coverUrls={coverUrls}
                        onSelect={setSelected}
                    />
                ) : null}

                <ChallengeDetailModal
                    challenge={selected}
                    coverUrl={selected ? coverUrls[selected.id] : undefined}
                    joinable={selected ? new Date(selected.starts_at) <= new Date() && new Date() <= new Date(selected.ends_at) : false}
                    isJoined={!!(selected && joinedChallenges.some((j) => j.id === selected.id))}
                    hasJoinedChallenge={joinedChallenges.length > 0 && !(selected && joinedChallenges.some((j) => j.id === selected.id))}
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
                    onComplete={async () => {
                        if (!selected) return;
                        try {
                            await finishChallenge(selected.id);
                            setJoinedChallenges((prev) => prev.filter((c) => c.id !== selected.id));
                        } catch {}
                    }}
                    onClose={() => setSelected(null)}
                />
            </Box>
        </Box>
    );
}
