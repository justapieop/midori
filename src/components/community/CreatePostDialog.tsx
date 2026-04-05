import { useRef, useState } from "react";
import type { JSX } from "react";
import { Box, Button, Dialog, Flex, Icon, Image, Portal, Text, Textarea } from "@chakra-ui/react";
import { LuPaperclip, LuX } from "react-icons/lu";
import { createPost, getAllPosts, getPostAttachments } from "@/api/post";
import type { Post } from "@/api/post";
import { fetchUserAssets } from "@/api/file";

interface CreatePostDialogProps {
    open: boolean;
    onClose: () => void;
    onPostCreated: (posts: Post[], newImages: Record<string, string[]>) => void;
}

export default function CreatePostDialog({ open, onClose, onPostCreated }: CreatePostDialogProps): JSX.Element {
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setContent("");
        setAttachments([]);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(d) => { if (!d.open) onClose(); }} size="md">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" bg="white" boxShadow="2xl" overflow="hidden">
                        <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
                        <Box p={6}>
                            <Dialog.Title mb={4} fontSize="md" fontWeight="semibold" color="gray.700">
                                Tạo bài viết mới
                            </Dialog.Title>
                            <Textarea
                                placeholder="Bạn đang nghĩ gì?"
                                rows={6}
                                resize="none"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                borderRadius="lg"
                                fontSize="sm"
                                color="black"
                                autoFocus
                                border="1px solid"
                                borderColor="gray.200"
                                _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px var(--chakra-colors-green-400)" }}
                            />

                            {attachments.length > 0 && (
                                <Flex gap={2} mt={3} flexWrap="wrap">
                                    {attachments.map((file, i) => (
                                        <Box key={i} position="relative">
                                            {file.type.startsWith("video/") ? (
                                                <Box
                                                    w="72px" h="72px"
                                                    bg="gray.100"
                                                    borderRadius="md"
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Text fontSize="2xs" color="gray.500" textAlign="center" px={1}>{file.name}</Text>
                                                </Box>
                                            ) : (
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    w="72px" h="72px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                />
                                            )}
                                            <Box
                                                position="absolute"
                                                top="-6px" right="-6px"
                                                bg="gray.600"
                                                borderRadius="full"
                                                p="2px"
                                                cursor="pointer"
                                                onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                                            >
                                                <Icon as={LuX} boxSize={3} color="white" />
                                            </Box>
                                        </Box>
                                    ))}
                                </Flex>
                            )}

                            <Flex
                                align="center"
                                gap={1.5}
                                mt={3}
                                color="gray.400"
                                cursor="pointer"
                                _hover={{ color: "green.500" }}
                                transition="color 0.15s"
                                width="fit-content"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Icon as={LuPaperclip} boxSize={4} />
                                <Text fontSize="sm">Thêm ảnh / video</Text>
                            </Flex>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const files = Array.from(e.target.files ?? []);
                                    setAttachments((prev) => [...prev, ...files]);
                                    e.target.value = "";
                                }}
                            />
                        </Box>

                        <Flex px={6} pb={6} justify="flex-end" gap={3}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Hủy
                            </Button>
                            <Button
                                colorPalette="green"
                                size="sm"
                                disabled={!content.trim() || submitting}
                                loading={submitting}
                                onClick={async () => {
                                    setSubmitting(true);
                                    try {
                                        await createPost({ content, attachments });
                                        reset();
                                        onClose();
                                        const data = await getAllPosts(100, 1);
                                        const imageMap: Record<string, string[]> = {};
                                        await Promise.all(
                                            data.posts.map((post) =>
                                                getPostAttachments(post.id).then((atts) => {
                                                    if (atts.length > 0) {
                                                        imageMap[post.id] = atts.map((att) => fetchUserAssets(post.author, att));
                                                    }
                                                }).catch(() => {})
                                            )
                                        );
                                        onPostCreated(data.posts, imageMap);
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                Đăng bài
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
