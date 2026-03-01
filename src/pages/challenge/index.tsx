import { useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import {
    Box,
    Button,
    Dialog,
    Flex,
    Grid,
    GridItem,
    Heading,
    Icon,
    Image,
    Portal,
    Separator,
    Spinner,
    Text,
} from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuTriangleAlert, LuCalendar, LuClock, LuStar, LuTrophy, LuX, LuCircleCheck } from "react-icons/lu";
import { getAllChallenges } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import { fetchImage } from "@/api/file";
import { getCurrentUserChallenge } from "@/api/user";
import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";

function StatChip({ icon, label }: { icon: ReactNode; label: string }): JSX.Element {
    return (
        <Flex
            align="center"
            gap={1.5}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            color="gray.600"
            fontWeight="medium"
        >
            {icon}
            <Text>{label}</Text>
        </Flex>
    );
}

function ChallengeCard({
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
                    <Image
                        src={coverUrl}
                        alt={challenge.title}
                        w="100%"
                        h="175px"
                        objectFit="cover"
                    />
                ) : (
                    <Flex w="100%" h="175px" bg="gray.100" align="center" justify="center" color="gray.300">
                        <Icon as={LuTrophy} boxSize={10} />
                    </Flex>
                )}
                {/* Subtle gradient scrim at the bottom of image */}
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
                    <StatChip icon={<LuClock />} label={`${challenge.duration} phút`} />
                    <StatChip icon={<LuCalendar />} label={`${start} – ${end}`} />
                </Flex>
            </Box>
        </Box>
    );
}

function ChallengeDetailModal({
    challenge,
    coverUrl,
    joinable,
    onClose,
}: {
    challenge: Challenge | null;
    coverUrl?: string;
    joinable: boolean;
    onClose: () => void;
}): JSX.Element {
    if (!challenge) return <></>;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const start = new Date(challenge.starts_at).toLocaleDateString("vi-VN");
    const end = new Date(challenge.ends_at).toLocaleDateString("vi-VN");

    return (
        <>
        <Dialog.Root open={!!challenge} onOpenChange={(d) => { if (!d.open) onClose(); }} size="md">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" overflow="hidden" bg="white" boxShadow="2xl">
                        {/* Cover image with gradient overlay + title */}
                        <Box position="relative" h="220px" flexShrink={0}>
                            {coverUrl ? (
                                <Image src={coverUrl} alt={challenge.title} w="100%" h="100%" objectFit="cover" />
                            ) : (
                                <Flex w="100%" h="100%" bg="gray.100" align="center" justify="center" color="gray.300">
                                    <Icon as={LuTrophy} boxSize={12} />
                                </Flex>
                            )}
                            <Box
                                position="absolute"
                                inset={0}
                                bgGradient="to-t"
                                gradientFrom="blackAlpha.700"
                                gradientTo="transparent"
                            />
                            <Box position="absolute" bottom={4} left={5} right={12}>
                                <Heading size="lg" color="white" lineClamp={2} textShadow="0 1px 4px rgba(0,0,0,0.5)">
                                    {challenge.title}
                                </Heading>
                            </Box>
                            <Dialog.CloseTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    position="absolute"
                                    top={3}
                                    right={3}
                                    color="white"
                                    _hover={{ bg: "blackAlpha.300" }}
                                    p={1}
                                    minW={0}
                                >
                                    <LuX />
                                </Button>
                            </Dialog.CloseTrigger>
                        </Box>

                        <Box p={6}>
                            <Text fontSize="sm" color="gray.600" mb={5} lineHeight="tall">
                                {challenge.description}
                            </Text>

                            {/* Stat chips row */}
                            <Flex gap={2} flexWrap="wrap" mb={5}>
                                <Flex
                                    align="center" gap={1.5}
                                    bg="green.50" border="1px solid" borderColor="green.200"
                                    borderRadius="full" px={3} py={1}
                                    fontSize="sm" color="green.700" fontWeight="medium"
                                >
                                    <LuStar />
                                    <Text>{challenge.points} điểm</Text>
                                </Flex>
                                <Flex
                                    align="center" gap={1.5}
                                    bg="blue.50" border="1px solid" borderColor="blue.200"
                                    borderRadius="full" px={3} py={1}
                                    fontSize="sm" color="blue.700" fontWeight="medium"
                                >
                                    <LuClock />
                                    <Text>{challenge.duration} phút</Text>
                                </Flex>
                                <Flex
                                    align="center" gap={1.5}
                                    bg="purple.50" border="1px solid" borderColor="purple.200"
                                    borderRadius="full" px={3} py={1}
                                    fontSize="sm" color="purple.700" fontWeight="medium"
                                >
                                    <LuCalendar />
                                    <Text>{start} – {end}</Text>
                                </Flex>
                            </Flex>

                            <Separator mb={5} />

                            <Box
                                mb={6}
                                pl={4}
                                borderLeft="3px solid"
                                borderColor="green.400"
                            >
                                <Heading size="xs" color="gray.700" mb={2} textTransform="uppercase" letterSpacing="wider">
                                    Hướng dẫn
                                </Heading>
                                <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap" lineHeight="tall">
                                    {challenge.instruction}
                                </Text>
                            </Box>

                            {joinable ? (
                            <Button
                                colorPalette="green"
                                w="100%"
                                size="lg"
                                borderRadius="xl"
                                bgGradient="to-r"
                                gradientFrom="green.400"
                                gradientTo="teal.400"
                                color="white"
                                fontWeight="semibold"
                                _hover={{ gradientFrom: "green.500", gradientTo: "teal.500" }}
                                onClick={() => setConfirmOpen(true)}
                            >
                                Tham gia thử thách
                            </Button>
                            ) : (
                            <Flex
                                align="center"
                                gap={2}
                                justify="center"
                                bg="orange.50"
                                border="1px solid"
                                borderColor="orange.200"
                                borderRadius="xl"
                                px={4}
                                py={3}
                            >
                                <Icon as={LuTriangleAlert} color="orange.400" boxSize={4} flexShrink={0} />
                                <Text fontSize="sm" color="orange.600" fontWeight="medium">
                                    Thử thách sắp diễn ra chưa thể tham gia.
                                </Text>
                            </Flex>
                            )}
                        </Box>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>

        {/* Confirmation dialog */}
        <Dialog.Root open={confirmOpen} onOpenChange={(d) => { if (!d.open) setConfirmOpen(false); }} size="sm">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" bg="white" boxShadow="2xl" p={6}>
                        <Flex direction="column" align="center" textAlign="center" gap={4}>
                            <Flex
                                bg="orange.50"
                                border="1px solid"
                                borderColor="orange.200"
                                borderRadius="full"
                                p={3}
                                color="orange.500"
                            >
                                <Icon as={LuTriangleAlert} boxSize={6} />
                            </Flex>

                            <Box>
                                <Heading size="md" color="gray.800" mb={2}>
                                    Bạn chắc chắn muốn tham gia?
                                </Heading>
                                <Text fontSize="sm" color="gray.500" lineHeight="tall">
                                    Nếu bạn thoát khỏi thử thách giữa chừng, toàn bộ tiến trình của bạn sẽ bị xóa.
                                    Bạn vẫn có thể tham gia lại thử thách sau.
                                </Text>
                            </Box>

                            <Flex gap={3} w="100%" mt={2}>
                                <Button
                                    flex={1}
                                    colorPalette="red"
                                    variant="outline"
                                    borderRadius="xl"
                                    onClick={() => setConfirmOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    flex={1}
                                    colorPalette="green"
                                    borderRadius="xl"
                                    bgGradient="to-r"
                                    gradientFrom="green.400"
                                    gradientTo="teal.400"
                                    color="white"
                                    fontWeight="semibold"
                                    _hover={{ gradientFrom: "green.500", gradientTo: "teal.500" }}
                                    onClick={() => { setConfirmOpen(false); onClose(); }}
                                >
                                    Xác nhận
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
        </>
    );
}

function ChallengeGrid({
    challenges,
    coverUrls,
    clickable,
    onSelect,
}: {
    challenges: Challenge[];
    coverUrls: Record<string, string>;
    clickable: boolean;
    onSelect: (c: Challenge) => void;
}): JSX.Element {
    return (
        <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={5}
        >
            {challenges.map((c) => (
                <GridItem key={c.id}>
                    <ChallengeCard
                        challenge={c}
                        coverUrl={coverUrls[c.id]}
                        clickable={clickable}
                        onSelect={onSelect}
                    />
                </GridItem>
            ))}
        </Grid>
    );
}

function ChallengeSection({
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
                <Heading size="md" color="gray.800">
                    {title}
                </Heading>
                <Box flex={1} h="1px" bg="gray.200" />
                <Text fontSize="sm" color="gray.400" fontWeight="medium">
                    {challenges.length} thử thách
                </Text>
            </Flex>
            <ChallengeGrid challenges={challenges} coverUrls={coverUrls} clickable={clickable} onSelect={onSelect} />
        </Box>
    );
}

function ChallengeSections({
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

export default function ChallengePage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
    const [selected, setSelected] = useState<Challenge | null>(null);
    const [joinedChallenge, setJoinedChallenge] = useState<Challenge | null>(null);

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }

        Promise.all([
            getAllChallenges(),
            getCurrentUserChallenge().catch(() => null),
        ]).then(([data, joined]) => {
                setJoinedChallenge(joined);
                setChallenges(data);
                const toLoad = joined ? [...data, joined] : data;
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
                {/* Joined challenge banner */}
                {joinedChallenge && (
                    <Box
                        mb={10}
                        borderRadius="2xl"
                        overflow="hidden"
                        boxShadow="md"
                        border="1px solid"
                        borderColor="green.200"
                        cursor="pointer"
                        onClick={() => setSelected(joinedChallenge)}
                        _hover={{ boxShadow: "lg" }}
                        transition="all 0.2s ease"
                        position="relative"
                    >
                        {/* Accent top bar */}
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
                            {coverUrls[joinedChallenge.id] ? (
                                <Image
                                    src={coverUrls[joinedChallenge.id]}
                                    alt={joinedChallenge.title}
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
                                <Heading size="md" color="gray.900" mb={2}>
                                    {joinedChallenge.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.500" mb={4} lineHeight="tall" lineClamp={2}>
                                    {joinedChallenge.description}
                                </Text>
                                <Flex gap={2} flexWrap="wrap">
                                    <StatChip icon={<LuStar />} label={`${joinedChallenge.points} điểm`} />
                                    <StatChip icon={<LuClock />} label={`${joinedChallenge.duration} phút`} />
                                    <StatChip
                                        icon={<LuCalendar />}
                                        label={`${new Date(joinedChallenge.starts_at).toLocaleDateString("vi-VN")} – ${new Date(joinedChallenge.ends_at).toLocaleDateString("vi-VN")}`}
                                    />
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>
                )}

                {challenges.filter((c) => c.id !== joinedChallenge?.id).length === 0 && !joinedChallenge ? (
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
                        challenges={challenges.filter((c) => c.id !== joinedChallenge?.id)}
                        coverUrls={coverUrls}
                        onSelect={setSelected}
                    />
                )}

                <ChallengeDetailModal
                    challenge={selected}
                    coverUrl={selected ? coverUrls[selected.id] : undefined}
                    joinable={selected ? new Date(selected.starts_at) <= new Date() && new Date() <= new Date(selected.ends_at) : false}
                    onClose={() => setSelected(null)}
                />
            </Box>
        </Box>
    );
}
