import { Box, Container, VStack, Icon, Text, Flex, Image, IconButton, Button } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import authgear, { SessionState } from "@authgear/web";
import { LuTrash2, LuSalad, LuUpload, LuX, LuSparkles } from "react-icons/lu";
import Navbar from "@/components/Navbar";
import { Provider } from "@/components/ui/provider";
import { AIHeroBanner } from "@/components/ai/AIHeroBanner";
import { toaster } from "@/components/ui/toaster";
import { prompt, PromptPreset } from "@/api/ai";
import ReactMarkdown from 'react-markdown';

export default function AIPage(): JSX.Element {
    const navigate = useNavigate();
    const [selectedFeature, setSelectedFeature] = useState<"classification" | "recipe">("classification");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
        }
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setAiResponse(null);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        setAiResponse(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setAiResponse(null);

        try {
            const promptText = selectedFeature === "classification" 
                ? PromptPreset.Recycle 
                : PromptPreset.Vegetarian;

            const response = await prompt({
                prompt: promptText,
                attachment: selectedFile
            });

            setAiResponse(response.content);
        } catch (error) {
            console.error("AI prompt failed:", error);
            toaster.create({
                title: "Lỗi",
                description: "Không thể xử lý yêu cầu. Vui lòng thử lại sau.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Provider>
            <Navbar />
            <Box minH="100vh" bg="#f4f7f5">
                <AIHeroBanner />
                <Container maxW="container.md" py={8}>
                    <Flex justify="center" mb={8}>
                        <Flex
                            bg="gray.200"
                            p={1}
                            borderRadius="full"
                            position="relative"
                            w="300px"
                        >
                            <Box
                                position="absolute"
                                top={1}
                                left={selectedFeature === "classification" ? 1 : "50%"}
                                w="calc(50% - 4px)"
                                h="calc(100% - 8px)"
                                bg="white"
                                borderRadius="full"
                                boxShadow="sm"
                                transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                            />
                            <Flex
                                flex={1}
                                zIndex={1}
                                justify="center"
                                align="center"
                                py={2}
                                cursor="pointer"
                                onClick={() => setSelectedFeature("classification")}
                                color={selectedFeature === "classification" ? "black" : "gray.600"}
                                fontWeight={selectedFeature === "classification" ? "bold" : "normal"}
                                transition="all 0.3s"
                                gap={2}
                            >
                                <Icon as={LuTrash2} />
                                <Text>Phân loại rác</Text>
                            </Flex>
                            <Flex
                                flex={1}
                                zIndex={1}
                                justify="center"
                                align="center"
                                py={2}
                                cursor="pointer"
                                onClick={() => setSelectedFeature("recipe")}
                                color={selectedFeature === "recipe" ? "black" : "gray.600"}
                                fontWeight={selectedFeature === "recipe" ? "bold" : "normal"}
                                transition="all 0.3s"
                                gap={2}
                            >
                                <Icon as={LuSalad} />
                                <Text>Món chay</Text>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Box mt={4}>
                        <Box
                            w="100%"
                            h="300px"
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="xl"
                            bg="white"
                            overflow="hidden"
                            position="relative"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{ borderColor: "green.400", bg: "green.50" }}
                            onClick={() => fileInputRef.current?.click()}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            {previewUrl ? (
                                <Box position="relative" w="100%" h="100%" bg="gray.100">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        w="100%"
                                        h="100%"
                                        objectFit="contain"
                                    />
                                    <IconButton
                                        aria-label="Xóa ảnh"
                                        position="absolute"
                                        top={3}
                                        right={3}
                                        size="sm"
                                        colorScheme="red"
                                        bg="red.500"
                                        color="white"
                                        borderRadius="full"
                                        onClick={handleClear}
                                        _hover={{ bg: "red.600" }}
                                    >
                                        <LuX />
                                    </IconButton>
                                </Box>
                            ) : (
                                <VStack gap={3} color="gray.500">
                                    <Icon as={LuUpload} boxSize={10} color="gray.400" />
                                    <VStack gap={1}>
                                        <Text fontWeight="medium" color="gray.700">
                                            Nhấn để tải ảnh lên
                                        </Text>
                                        <Text fontSize="sm">
                                            hoặc kéo thả ảnh vào đây
                                        </Text>
                                    </VStack>
                                </VStack>
                            )}
                        </Box>

                        {selectedFile && (
                            <Flex justify="center" mt={6}>
                                <Button
                                    size="lg"
                                    colorScheme="green"
                                    bg="#4a7c59"
                                    color="white"
                                    px={8}
                                    borderRadius="full"
                                    onClick={handleSubmit}
                                    loading={isLoading}
                                    loadingText="AI đang xử lý..."
                                    _hover={{ bg: "#3d6649", transform: "translateY(-2px)", boxShadow: "md" }}
                                    transition="all 0.2s"
                                >
                                    <Icon as={LuSparkles} mr={2} />
                                    Phân tích hình ảnh
                                </Button>
                            </Flex>
                        )}

                        {aiResponse && (
                            <Box mt={6} p={6} bg="white" borderRadius="xl" boxShadow="md" borderLeft="4px solid" borderColor="#4a7c59">
                                <Text fontSize="sm" color="#4a7c59" mb={3} fontWeight="bold">KẾT QUẢ</Text>
                                <Box className="markdown-body" css={{
                                    color: "black",
                                    "& p": { marginBottom: "1em" },
                                    "& h1, & h2, & h3": { fontWeight: "bold", marginTop: "1.5em", marginBottom: "0.5em" },
                                    "& ul, & ol": { paddingLeft: "1.5em", marginBottom: "1em" },
                                    "& li": { marginBottom: "0.25em" },
                                    "& a": { color: "blue.500", textDecoration: "underline" },
                                    "& strong": { fontWeight: "bold" }
                                }}>
                                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                </Box>
                            </Box>
                        )}

                    </Box>
                </Container>
            </Box>
        </Provider>
    );
}