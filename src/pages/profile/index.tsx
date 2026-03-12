import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Spinner, Text } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuCircleUser } from "react-icons/lu";
import { fetchUserProfile, getCurrentUserChallenge, updateBio } from "@/api/user";
import type { UserProfile } from "@/api/user";
import type { Challenge } from "@/api/challenge";
import { fetchPublicAssets } from "@/api/file";
import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { JoinedChallengeCard } from "@/components/profile/JoinedChallengeCard";

export default function ProfilePage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [challenge, setChallenge] = useState<Challenge[]>([]);
    const [challengeCoverUrls, setChallengeCoverUrls] = useState<Record<string, string>>({});
    const [bioEditing, setBioEditing] = useState(false);
    const [bioValue, setBioValue] = useState("");

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }

        Promise.all([
            fetchUserProfile(),
            getCurrentUserChallenge().catch(() => []),
        ]).then(([prof, ch]) => {
            setProfile(prof);
            setChallenge(ch);
            setBioValue(prof.bio ?? "");
            ch.forEach((c) => {
                if (!c.cover_image) return;
                setChallengeCoverUrls((prev) => ({ ...prev, [c.id]: fetchPublicAssets(c.cover_image) }));
            });
        }).finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="gray.50">
                <Spinner size="lg" />
            </Flex>
        );
    }

    if (!profile) return <></>;

    const displayName = profile.name ?? profile.name ?? profile.email ?? "Người dùng";
    const joinedDate = new Date(profile.created_at).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

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
                pb={6}
            >
                <Flex maxW="800px" mx="auto" py={10} align="center" gap={4}>
                    <Box bg="whiteAlpha.200" borderRadius="xl" p={3} color="white">
                        <Icon as={LuCircleUser} boxSize={7} />
                    </Box>
                    <Box>
                        <Heading size="xl" color="white" fontWeight="bold">
                            Hồ sơ
                        </Heading>
                        <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                            Xem thông tin cá nhân và theo dõi tiến trình của bạn.
                        </Text>
                    </Box>
                </Flex>
            </Box>

            <Box px={{ base: 4, md: 8 }} maxW="800px" mx="auto" mt={8} pb={10}>
                <ProfileCard
                    profile={profile}
                    displayName={displayName}
                    joinedDate={joinedDate}
                    bioValue={bioValue}
                    bioEditing={bioEditing}
                    onBioChange={setBioValue}
                    onBioSave={() => {
                        updateBio(bioValue).catch(() => {});
                        setBioEditing(false);
                    }}
                    onBioCancel={() => {
                        setBioValue(profile.bio ?? "");
                        setBioEditing(false);
                    }}
                    onBioEdit={() => setBioEditing(true)}
                />

                {challenge.map((c) => (
                    <JoinedChallengeCard
                        key={c.id}
                        challenge={c}
                        coverUrl={challengeCoverUrls[c.id]}
                    />
                ))}
            </Box>
        </Box>
    );
}
