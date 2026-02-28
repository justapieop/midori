import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { Badge, Box, Dialog, Field, Flex, Grid, Heading, IconButton, Image, Input, Portal, Skeleton, Text, Textarea, Button } from "@chakra-ui/react";
import { LuCalendar, LuClock, LuStar, LuTrophy, LuUpload, LuX } from "react-icons/lu";
import { getAllChallenges, enrollChallenge, uploadChallenge } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import { toaster } from "@/components/ui/toaster";
import { getCurrentUserChallenge } from "@/api/user";


function ActiveChallengeView({ challenge }: { challenge: Challenge }): JSX.Element {
    return (
        <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            overflow="hidden"
            maxW="480px"
            border="1px solid"
            borderColor="green.100"
        >
            {/* Header banner */}
            <Box
                bgGradient="to-br"
                gradientFrom="green.400"
                gradientTo="teal.500"
                px={6}
                py={5}
            >
                <Flex align="center" gap={3}>
                    <Box bg="whiteAlpha.300" borderRadius="lg" p={2}>
                        <LuTrophy size={22} color="white" />
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="whiteAlpha.800" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">Thử thách đang tham gia</Text>
                        <Text fontWeight="bold" fontSize="lg" color="white" lineClamp={1}>{challenge.title}</Text>
                    </Box>
                </Flex>
                {/* Stat badges */}
                <Flex gap={3} mt={4} wrap="wrap">
                    <Flex align="center" gap={1} bg="whiteAlpha.200" borderRadius="full" px={3} py={1}>
                        <LuStar size={13} color="white" />
                        <Text fontSize="xs" color="white" fontWeight="semibold">{challenge.points} điểm</Text>
                    </Flex>
                    <Flex align="center" gap={1} bg="whiteAlpha.200" borderRadius="full" px={3} py={1}>
                        <LuClock size={13} color="white" />
                        <Text fontSize="xs" color="white" fontWeight="semibold">{challenge.duration} ngày</Text>
                    </Flex>
                    <Flex align="center" gap={1} bg="whiteAlpha.200" borderRadius="full" px={3} py={1}>
                        <LuCalendar size={13} color="white" />
                        <Text fontSize="xs" color="white" fontWeight="semibold">Đến {new Date(challenge.ends_at).toLocaleDateString("vi-VN")}</Text>
                    </Flex>
                </Flex>
            </Box>

            {/* Body */}
            <Flex direction="column" gap={4} p={6}>
                <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>Mô tả</Text>
                    <Text fontSize="sm" color="gray.700">{challenge.description}</Text>
                </Box>
                <Box h="1px" bg="gray.100" />
                <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>Hướng dẫn</Text>
                    <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">{challenge.instruction}</Text>
                </Box>
                <Box h="1px" bg="gray.100" />
                <Flex gap={6}>
                    <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mb={1}>Bắt đầu</Text>
                        <Text fontSize="sm" color="gray.700">{new Date(challenge.starts_at).toLocaleString("vi-VN")}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mb={1}>Kết thúc</Text>
                        <Text fontSize="sm" color="gray.700">{new Date(challenge.ends_at).toLocaleString("vi-VN")}</Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
}


function UploadImagePane({ challengeId }: { challengeId: string }): JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        if (f) {
            const url = URL.createObjectURL(f);
            setPreview(url);
        } else {
            setPreview(null);
        }
    }

    async function handleUpload() {
        if (!file) return;
        setUploading(true);
        const toastId = toaster.create({ title: "Đang tải ảnh lên...", type: "loading" });
        try {
            await uploadChallenge(challengeId, file);
            toaster.update(toastId, { title: "Tải ảnh thành công!", type: "success", duration: 2000 });
            setFile(null);
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
        } catch {
            toaster.update(toastId, { title: "Tải ảnh thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
        } finally {
            setUploading(false);
        }
    }

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
            flex={1}
            minW="260px"
            display="flex"
            flexDirection="column"
        >
            {/* Header */}
            <Flex align="center" gap={3} px={6} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box bg="green.100" borderRadius="lg" p={2} color="green.600">
                    <LuUpload size={18} />
                </Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.800">Nộp ảnh thử thách</Text>
            </Flex>
            <Flex direction="column" gap={4} flex={1} p={6}>
                <Box
                    border="2px dashed"
                    borderColor={preview ? "green.400" : "gray.200"}
                    borderRadius="xl"
                    p={4}
                    textAlign="center"
                    cursor="pointer"
                    bg={preview ? "green.50" : "gray.50"}
                    _hover={{ borderColor: "green.400", bg: "green.50" }}
                    transition="all 0.2s"
                    onClick={() => inputRef.current?.click()}
                    flex={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {preview ? (
                        <Image src={preview} alt="preview" maxH="200px" borderRadius="md" objectFit="contain" />
                    ) : (
                        <Flex direction="column" align="center" gap={2} color="gray.400">
                            <Box bg="gray.100" borderRadius="full" p={3}>
                                <LuUpload size={24} />
                            </Box>
                            <Text fontSize="xs" fontWeight="medium">Nhấn để chọn ảnh</Text>
                            <Text fontSize="xs" color="gray.300">PNG, JPG, WEBP</Text>
                        </Flex>
                    )}
                </Box>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                <Flex gap={2}>
                    <Button
                        size="sm"
                        bgGradient="to-r"
                        gradientFrom="green.500"
                        gradientTo="teal.500"
                        color="white"
                        _hover={{ gradientFrom: "green.600", gradientTo: "teal.600" }}
                        flex={1}
                        disabled={!file}
                        loading={uploading}
                        onClick={handleUpload}
                    >
                        Tải lên
                    </Button>
                    {preview && (
                        <Button
                            size="sm"
                            variant="ghost"
                            color="gray.500"
                            disabled={uploading}
                            onClick={() => { setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
                        >
                            Xoá
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
}

function ChallengeList(): JSX.Element {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null);
    const [confirmEnroll, setConfirmEnroll] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    async function handleEnroll() {
        if (!viewChallenge) return;
        setEnrolling(true);
        const toastId = toaster.create({ title: "Đang đăng ký thử thách...", type: "loading" });
        try {
            await enrollChallenge(viewChallenge.id);
            toaster.update(toastId, { title: "Đăng ký thành công!", type: "success", duration: 2000 });
            setConfirmEnroll(false);
            setViewChallenge(null);
        } catch {
            toaster.update(toastId, { title: "Đăng ký thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
        } finally {
            setEnrolling(false);
        }
    }

    useEffect(() => {
        getAllChallenges()
            .then(setChallenges)
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            {loading ? (
                <Grid
                    templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={4}
                >
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
                >
                    {challenges.map((challenge) => (
                        <Box
                            key={challenge.id}
                            bg="white"
                            borderRadius="xl"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor="gray.100"
                            p={5}
                            cursor="pointer"
                            _hover={{ boxShadow: "lg", borderColor: "green.300", transform: "translateY(-2px)" }}
                            transition="all 0.18s"
                            onClick={() => setViewChallenge(challenge)}
                            borderLeft="4px solid"
                            borderLeftColor="green.400"
                            position="relative"
                            overflow="hidden"
                        >
                            <Box
                                position="absolute" top={0} right={0}
                                w="80px" h="80px"
                                bgGradient="to-bl"
                                gradientFrom="green.50"
                                gradientTo="transparent"
                                borderBottomLeftRadius="full"
                                pointerEvents="none"
                            />
                            <Text fontWeight="bold" color="gray.800" fontSize="sm" mb={1}>
                                {challenge.title}
                            </Text>
                            <Text color="gray.500" fontSize="xs" lineClamp={2} mb={3}>
                                {challenge.description}
                            </Text>
                            <Flex gap={2}>
                                <Badge colorPalette="green" variant="subtle" fontSize="10px" borderRadius="full">
                                    <LuStar size={10} /> {challenge.points} điểm
                                </Badge>
                                <Badge colorPalette="teal" variant="subtle" fontSize="10px" borderRadius="full">
                                    <LuClock size={10} /> {challenge.duration} ngày
                                </Badge>
                            </Flex>
                        </Box>
                    ))}
                </Grid>
            )}

            <Dialog.Root open={!!viewChallenge} onOpenChange={(e) => { if (!e.open) setViewChallenge(null); }}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content borderRadius="xl" p={6} maxW="480px" w="full" bg="white">
                            <Flex justify="space-between" align="center" mb={4}>
                                <Dialog.Title>
                                    <Heading size="md" color="gray.800">Chi tiết thử thách</Heading>
                                </Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <IconButton aria-label="Đóng" variant="ghost" size="sm">
                                        <LuX />
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </Flex>
                            <Dialog.Body px={0}>
                                {viewChallenge && (
                                    <Flex direction="column" gap={4}>
                                        <Field.Root>
                                            <Field.Label fontSize="sm" color="gray.700">Tiêu đề</Field.Label>
                                            <Input size="sm" value={viewChallenge.title} readOnly color="black" bg="gray.50" />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm" color="gray.700">Mô tả</Field.Label>
                                            <Textarea size="sm" value={viewChallenge.description} readOnly color="black" bg="gray.50" rows={3} />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm" color="gray.700">Hướng dẫn</Field.Label>
                                            <Textarea size="sm" value={viewChallenge.instruction} readOnly color="black" bg="gray.50" rows={3} />
                                        </Field.Root>
                                        <Flex gap={4}>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Điểm thưởng</Field.Label>
                                                <Input size="sm" value={viewChallenge.points} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Thời lượng (ngày)</Field.Label>
                                                <Input size="sm" value={viewChallenge.duration} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                        </Flex>
                                        <Flex gap={4}>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Ngày bắt đầu</Field.Label>
                                                <Input size="sm" value={new Date(viewChallenge.starts_at).toLocaleString("vi-VN")} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Ngày kết thúc</Field.Label>
                                                <Input size="sm" value={new Date(viewChallenge.ends_at).toLocaleString("vi-VN")} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                        </Flex>
                                    </Flex>
                                )}
                            </Dialog.Body>
                            <Flex justify="space-between" align="center" mt={6}>
                                <Button
                                    size="sm"
                                    bg="green.600"
                                    color="white"
                                    _hover={{ bg: "green.700" }}
                                    onClick={() => setConfirmEnroll(true)}
                                >
                                    Tham gia thử thách
                                </Button>
                                <Button size="sm" variant="ghost" color="gray.600" onClick={() => setViewChallenge(null)}>Đóng</Button>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Dialog.Root open={confirmEnroll} onOpenChange={(e) => { if (enrolling) return; setConfirmEnroll(e.open); }}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content borderRadius="xl" p={6} maxW="420px" w="full" bg="white">
                            <Flex justify="space-between" align="center" mb={4}>
                                <Dialog.Title>
                                    <Heading size="md" color="gray.800">Xác nhận tham gia</Heading>
                                </Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <IconButton aria-label="Đóng" variant="ghost" size="sm" disabled={enrolling}>
                                        <LuX />
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </Flex>
                            <Dialog.Body px={0}>
                                <Text fontSize="sm" color="gray.700">
                                    Bạn chỉ có thể tham gia một thử thách tại một thời điểm. Nếu bạn hủy giữa chừng, toàn bộ tiến trình sẽ bị xóa nhưng bạn vẫn có thể tham gia lại thử thách này.
                                </Text>
                            </Dialog.Body>
                            <Flex justify="flex-end" gap={2} mt={6}>
                                <Button size="sm" variant="ghost" color="gray.600" disabled={enrolling} onClick={() => setConfirmEnroll(false)}>Huỷ</Button>
                                <Button
                                    size="sm"
                                    bg="green.600"
                                    color="white"
                                    _hover={{ bg: "green.700" }}
                                    loading={enrolling}
                                    onClick={handleEnroll}
                                >
                                    Xác nhận
                                </Button>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}

export default function ChallengePage(): JSX.Element {
    const [userChallenge, setUserChallenge] = useState<Challenge | null>(null);
    const [userChallengeLoading, setUserChallengeLoading] = useState(true);

    useEffect(() => {
        getCurrentUserChallenge()
            .then(setUserChallenge)
            .catch(() => setUserChallenge(null))
            .finally(() => setUserChallengeLoading(false));
    }, []);

    const hasActiveChallenge = !userChallengeLoading && userChallenge !== null && new Date(userChallenge.ends_at) >= new Date();

    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box
                pt={`calc(${NAVBAR_HEIGHT} + 2rem)`}
                px={{ base: 4, md: 8 }}
                maxW="1200px"
                mx="auto"
            >
                <Heading size="lg" mb={1} color="gray.800" fontWeight="extrabold">
                    {hasActiveChallenge ? "🏆 Bạn đã tham gia thử thách" : "Thử thách"}
                </Heading>
                {!hasActiveChallenge && !userChallengeLoading && (
                    <Text fontSize="sm" color="gray.400" mb={6}>Chọn một thử thách để bắt đầu hành trình của bạn.</Text>
                )}

                {userChallengeLoading ? (
                    <Grid
                        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                        gap={4}
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} borderRadius="xl" height="72px" />
                        ))}
                    </Grid>
                ) : hasActiveChallenge ? (
                    <Flex gap={6} align="stretch" wrap="wrap" mt={6}>
                        <ActiveChallengeView challenge={userChallenge!} />
                        <UploadImagePane challengeId={userChallenge!.id} />
                    </Flex>
                ) : (
                    <ChallengeList />
                )}
            </Box>
        </Box>
    );
}