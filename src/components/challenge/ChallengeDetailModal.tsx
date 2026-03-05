import { useState } from "react";
import type { JSX } from "react";
import {
    Box,
    Button,
    Dialog,
    Flex,
    Heading,
    Icon,
    Image,
    Portal,
    Separator,
    Text,
} from "@chakra-ui/react";
import { LuTriangleAlert, LuCalendar, LuClock, LuStar, LuTrophy, LuX } from "react-icons/lu";
import type { Challenge } from "@/api/challenge";

export function ChallengeDetailModal({
    challenge,
    coverUrl,
    joinable,
    isJoined,
    onJoin,
    onWithdraw,
    onClose,
}: {
    challenge: Challenge | null;
    coverUrl?: string;
    joinable: boolean;
    isJoined: boolean;
    onJoin: () => void;
    onWithdraw: () => void;
    onClose: () => void;
}): JSX.Element {
    const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (!challenge) return <></>;

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
                                    <Text>{challenge.duration} ngày</Text>
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

                            <Box mb={6} pl={4} borderLeft="3px solid" borderColor="green.400">
                                <Heading size="xs" color="gray.700" mb={2} textTransform="uppercase" letterSpacing="wider">
                                    Hướng dẫn
                                </Heading>
                                <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap" lineHeight="tall">
                                    {challenge.instruction}
                                </Text>
                            </Box>

                            {isJoined ? (
                                <Button
                                    colorPalette="red"
                                    w="100%"
                                    size="lg"
                                    borderRadius="xl"
                                    variant="outline"
                                    fontWeight="semibold"
                                    onClick={() => setWithdrawConfirmOpen(true)}
                                >
                                    Rút khỏi thử thách
                                </Button>
                            ) : joinable ? (
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

        {/* Withdraw confirmation dialog */}
        <Dialog.Root open={withdrawConfirmOpen} onOpenChange={(d) => { if (!d.open) setWithdrawConfirmOpen(false); }} size="sm">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" bg="white" boxShadow="2xl" p={6}>
                        <Flex direction="column" align="center" textAlign="center" gap={4}>
                            <Flex bg="red.50" border="1px solid" borderColor="red.200" borderRadius="full" p={3} color="red.500">
                                <Icon as={LuTriangleAlert} boxSize={6} />
                            </Flex>
                            <Box>
                                <Heading size="md" color="gray.800" mb={2}>Rút khỏi thử thách?</Heading>
                                <Text fontSize="sm" color="gray.500" lineHeight="tall">
                                    Toàn bộ tiến trình của bạn sẽ bị xóa.
                                    Bạn vẫn có thể tham gia lại thử thách sau.
                                </Text>
                            </Box>
                            <Flex gap={3} w="100%" mt={2}>
                                <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setWithdrawConfirmOpen(false)}>
                                    Hủy
                                </Button>
                                <Button
                                    flex={1}
                                    colorPalette="red"
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    onClick={() => { setWithdrawConfirmOpen(false); onWithdraw(); onClose(); }}
                                >
                                    Xác nhận rút
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>

        {/* Join confirmation dialog */}
        <Dialog.Root open={confirmOpen} onOpenChange={(d) => { if (!d.open) setConfirmOpen(false); }} size="sm">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" bg="white" boxShadow="2xl" p={6}>
                        <Flex direction="column" align="center" textAlign="center" gap={4}>
                            <Flex bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="full" p={3} color="orange.500">
                                <Icon as={LuTriangleAlert} boxSize={6} />
                            </Flex>
                            <Box>
                                <Heading size="md" color="gray.800" mb={2}>Bạn chắc chắn muốn tham gia?</Heading>
                                <Text fontSize="sm" color="gray.500" lineHeight="tall">
                                    Nếu bạn thoát khỏi thử thách giữa chừng, toàn bộ tiến trình của bạn sẽ bị xóa.
                                    Bạn vẫn có thể tham gia lại thử thách sau.
                                </Text>
                            </Box>
                            <Flex gap={3} w="100%" mt={2}>
                                <Button flex={1} colorPalette="red" variant="outline" borderRadius="xl" onClick={() => setConfirmOpen(false)}>
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
                                    onClick={() => { setConfirmOpen(false); onJoin(); onClose(); }}
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
