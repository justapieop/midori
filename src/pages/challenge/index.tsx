import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuTrophy } from "react-icons/lu";
import { getAllChallenges, withdrawChallenge, enrollChallenge, finishChallenge } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import { fetchPublicAssets } from "@/api/file";
import { getCurrentUserChallenge } from "@/api/user";
import { userChallengeCache, userChallengeLinkCache, SINGLE } from "@/api/cache";
import type { UserChallenge } from "@/api/challenge";
import Navbar from "@/components/Navbar";
import { ChallengeDetailModal } from "@/components/challenge/ChallengeDetailModal";
import { ChallengeHeroBanner } from "@/components/challenge/ChallengeHeroBanner";
import { ChallengeSections } from "@/components/challenge/ChallengeSection";
import { JoinedChallengeBanner } from "@/components/challenge/JoinedChallengeBanner";
import { ChallengeUpload } from "@/components/challenge/ChallengeUpload";
import { ChallengeUploadGallery } from "@/components/challenge/ChallengeUploadGallery";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function ChallengePage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
    const [selected, setSelected] = useState<Challenge | null>(null);
    const [joinedChallenges, setJoinedChallenges] = useState<UserChallenge[]>([]);
    const [galleryRefreshKeys, setGalleryRefreshKeys] = useState<Record<string, number>>({});

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }

        Promise.all([
            getAllChallenges(),
            getCurrentUserChallenge().catch(() => null),
        ]).then(([data, joined]) => {
                const joinedList = joined ? [joined] : [];
                setJoinedChallenges(joinedList);
                setChallenges(data);
                const toLoad = [...data, ...joinedList];
                toLoad.forEach((c) => {
                    if (!c.cover_image) return;
                    setCoverUrls((prev) => ({ ...prev, [c.id]: fetchPublicAssets(c.cover_image) }));
                });
            })
            .catch(console.error)
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
                    <Box key={jc.id}>
                        <JoinedChallengeBanner
                            challenge={jc}
                            coverUrl={coverUrls[jc.id]}
                            onSelect={setSelected}
                        />
                        <ChallengeUpload
                            challengeId={jc.id}
                            onUploadSuccess={() =>
                                setGalleryRefreshKeys((prev) => ({ ...prev, [jc.id]: (prev[jc.id] ?? 0) + 1 }))
                            }
                        />
                        <ChallengeUploadGallery
                            challengeId={jc.id}
                            refreshKey={galleryRefreshKeys[jc.id] ?? 0}
                            joinedAt={new Date(jc.joined_at)}
                            endsAt={new Date(jc.ends_at)}
                        />
                    </Box>
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
                            userChallengeCache.delete(SINGLE);
                            userChallengeLinkCache.delete(SINGLE);
                            const refreshed = await getCurrentUserChallenge();
                            if (refreshed) setJoinedChallenges([refreshed]);
                            setSelected(null);
                            window.scrollTo({ top: 0, behavior: "smooth" });
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
