import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Button, Flex, Grid, Heading, Image, Skeleton, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { getAllChallenges } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import { fetchPublicAssets } from "@/api/file";
import { CreateChallengeModal } from "@/components/admin/challenge/CreateChallengeModal";
import { ViewChallengeModal } from "@/components/admin/challenge/ViewChallengeModal";

export default function AdminChallengePage(): JSX.Element {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null);
    const [coverImageUrls, setCoverImageUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        getAllChallenges()
            .then((data) => {
                setChallenges(data);
                data.forEach((c) => {
                    if (!c.cover_image) return;
                    setCoverImageUrls((prev) => ({ ...prev, [c.id]: fetchPublicAssets(c.cover_image) }));
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Box minH="100vh" bg="gray.50">
            <Box pt="2rem" px={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
                <Button
                    variant="ghost"
                    size="sm"
                    color="gray.600"
                    _hover={{ bg: "gray.100" }}
                    mb={6}
                    gap={2}
                    onClick={() => navigate("/admin")}
                >
                    <LuArrowLeft />
                    Quản trị
                </Button>

                <Flex align="center" justify="space-between" mb={6}>
                    <Heading size="lg" color="gray.800">Quản lý thử thách</Heading>
                    <Button
                        size="sm"
                        bg="green.600"
                        color="white"
                        _hover={{ bg: "green.700" }}
                        gap={2}
                        onClick={() => setModalOpen(true)}
                    >
                        <LuPlus />
                        Thêm thử thách
                    </Button>
                </Flex>

                {loading ? (
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} borderRadius="xl" height="72px" />
                        ))}
                    </Grid>
                ) : challenges.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">Chưa có thử thách nào.</Text>
                ) : (
                    <Grid
                        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                        gap={4}
                        alignItems="start"
                    >
                        {challenges.map((c) => (
                            <Box
                                key={c.id}
                                bg="white"
                                borderRadius="xl"
                                boxShadow="sm"
                                border="1px solid"
                                borderColor="gray.200"
                                overflow="hidden"
                                cursor="pointer"
                                _hover={{ boxShadow: "md", borderColor: "green.300" }}
                                transition="all 0.15s"
                                onClick={() => setViewChallenge(c)}
                            >
                                {coverImageUrls[c.id] && (
                                    <Image src={coverImageUrls[c.id]} alt={c.title} w="full" objectFit="contain" />
                                )}
                                <Box p={5}>
                                    <Text fontWeight="semibold" color="gray.800" fontSize="sm">{c.title}</Text>
                                    <Text color="gray.500" fontSize="xs" mt={1} lineClamp={2}>{c.description}</Text>
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                )}
            </Box>

            <CreateChallengeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={(created, coverUrl) => {
                    setChallenges((prev) => [...prev, created]);
                    if (coverUrl) setCoverImageUrls((prev) => ({ ...prev, [created.id]: coverUrl }));
                }}
            />

            <ViewChallengeModal
                challenge={viewChallenge}
                coverUrl={viewChallenge ? coverImageUrls[viewChallenge.id] : undefined}
                onClose={() => setViewChallenge(null)}
                onDeleted={(id) => setChallenges((prev) => prev.filter((c) => c.id !== id))}
            />
        </Box>
    );
}
