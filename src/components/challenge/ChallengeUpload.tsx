import { useRef, useState, useEffect } from "react";
import type { JSX, ChangeEvent } from "react";
import { Box, Button, Flex, Icon, Image, Spinner, Text } from "@chakra-ui/react";
import { LuCalendarCheck, LuCircleCheck, LuCircleX, LuPaperclip, LuUpload, LuX } from "react-icons/lu";
import { uploadChallenge } from "@/api/challenge";
import { getCurrentChallengeUserUploads } from "@/api/user";
import { userUploadsCache } from "@/api/cache";

const MAX_BYTES: number = 10 * 1024 * 1024;

type UploadState = "idle" | "uploading" | "success" | "error";

export function ChallengeUpload({ challengeId, onUploadSuccess }: { challengeId: string; onUploadSuccess?: () => void }): JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [sizeError, setSizeError] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [hasUploadedToday, setHasUploadedToday] = useState(false);

    useEffect(() => {
        getCurrentChallengeUserUploads(challengeId)
            .then((uploads) => {
                const today = new Date().toLocaleDateString();
                setHasUploadedToday(
                    uploads.some((u) => new Date(u.created_at).toLocaleDateString() === today)
                );
            })
            .catch(() => {});
    }, [challengeId]);

    function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
        const picked = e.target.files?.[0] ?? null;
        setSizeError(false);
        setUploadState("idle");
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (picked && picked.size > MAX_BYTES) {
            setSizeError(true);
            setFile(null);
            setPreviewUrl(null);
            return;
        }
        setFile(picked);
        setPreviewUrl(picked ? URL.createObjectURL(picked) : null);
    }

    async function handleUpload(): Promise<void> {
        if (!file) return;
        setUploadState("uploading");
        try {
            await uploadChallenge(challengeId, file);
            userUploadsCache.delete(challengeId);
            setUploadState("success");
            setHasUploadedToday(true);
            setFile(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            if (inputRef.current) inputRef.current.value = "";
            onUploadSuccess?.();
        } catch {
            setUploadState("error");
        }
    }

    return (
        <Box
            mb={10}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            overflow="hidden"
            boxShadow="sm"
        >
            <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
            <Box px={6} py={5}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                    Tải lên bằng chứng hoàn thành
                </Text>

                {hasUploadedToday ? (
                    <Flex align="center" gap={3} bg="green.50" borderRadius="xl" px={4} py={3} border="1px solid" borderColor="green.200">
                        <Icon as={LuCalendarCheck} boxSize={5} color="green.500" flexShrink={0} />
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                Hôm nay bạn đã tải lên rồi!
                            </Text>
                            <Text fontSize="xs" color="green.600">
                                Mỗi ngày chỉ được tải lên một lần. Hẹn gặp lại vào ngày mai.
                            </Text>
                        </Box>
                    </Flex>
                ) : (
                    <>
                    <Flex
                    direction={{ base: "column", sm: "row" }}
                    gap={3}
                    align={{ base: "stretch", sm: "center" }}
                >
                    <Flex
                        flex={1}
                        align="center"
                        gap={3}
                        bg="gray.50"
                        border="1px dashed"
                        borderColor={sizeError ? "red.300" : file ? "green.300" : "gray.300"}
                        borderRadius="xl"
                        px={4}
                        py={3}
                        cursor="pointer"
                        onClick={() => inputRef.current?.click()}
                        _hover={{ borderColor: "green.300", bg: "green.50" }}
                        transition="all 0.15s ease"
                        overflow="hidden"
                    >
                        {previewUrl ? (
                            <Box position="relative" flexShrink={0}>
                                <Image
                                    src={previewUrl}
                                    alt="preview"
                                    w="56px"
                                    h="56px"
                                    borderRadius="lg"
                                    objectFit="cover"
                                    border="1px solid"
                                    borderColor="green.200"
                                />
                                <Box
                                    position="absolute"
                                    top={-1}
                                    right={-1}
                                    bg="blackAlpha.600"
                                    borderRadius="full"
                                    p="2px"
                                    cursor="pointer"
                                    color="white"
                                    _hover={{ bg: "blackAlpha.800" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null);
                                        setFile(null);
                                        if (inputRef.current) inputRef.current.value = "";
                                    }}
                                >
                                    <Icon as={LuX} boxSize={2.5} />
                                </Box>
                            </Box>
                        ) : (
                            <Icon
                                as={LuPaperclip}
                                boxSize={4}
                                color="gray.400"
                                flexShrink={0}
                            />
                        )}
                        <Text
                            fontSize="sm"
                            color={file ? "gray.700" : "gray.400"}
                            truncate
                        >
                            {file ? file.name : "Chọn ảnh (tối đa 10MB)"}
                        </Text>
                    </Flex>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />

                    <Button
                        colorPalette="green"
                        borderRadius="xl"
                        px={5}
                        fontWeight="semibold"
                        disabled={!file || uploadState === "uploading"}
                        onClick={handleUpload}
                        flexShrink={0}
                    >
                        {uploadState === "uploading" ? (
                            <Flex align="center" gap={2}>
                                <Spinner size="xs" />
                                <Text>Đang tải...</Text>
                            </Flex>
                        ) : (
                            <Flex align="center" gap={2}>
                                <Icon as={LuUpload} boxSize={4} />
                                <Text>Tải lên</Text>
                            </Flex>
                        )}
                    </Button>
                </Flex>

                {sizeError && (
                    <Flex align="center" gap={2} mt={3}>
                        <Icon as={LuCircleX} color="red.400" boxSize={4} />
                        <Text fontSize="xs" color="red.500" fontWeight="medium">
                            File vượt quá 10MB. Vui lòng chọn file nhỏ hơn.
                        </Text>
                    </Flex>
                )}
                {uploadState === "success" && (
                    <Flex align="center" gap={2} mt={3}>
                        <Icon as={LuCircleCheck} color="green.500" boxSize={4} />
                        <Text fontSize="xs" color="green.600" fontWeight="medium">
                            Tải lên thành công!
                        </Text>
                    </Flex>
                )}
                {uploadState === "error" && (
                    <Flex align="center" gap={2} mt={3}>
                        <Icon as={LuCircleX} color="red.400" boxSize={4} />
                        <Text fontSize="xs" color="red.500" fontWeight="medium">
                            Tải lên thất bại. Vui lòng thử lại.
                        </Text>
                    </Flex>
                )}
                    </>
                )}
            </Box>
        </Box>
    );
}
