import { useState, useRef } from "react";
import type { JSX } from "react";
import { Avatar, Box, Flex, Icon, Separator, Text, Input, Button, Spinner, VStack, Image } from "@chakra-ui/react";
import { LuHeart, LuMessageCircle, LuSend, LuImage, LuX } from "react-icons/lu";
import type { Post } from "@/api/post";
import type { UserProfile } from "@/api/user";
import PostImageGrid from "./PostImageGrid";
import { fetchPostComment, createComment } from "@/api/comment";
import type { Comment } from "@/api/comment";
import { getUserById } from "@/api/user";

import CommentItem from "./CommentItem";

interface PostCardProps {
    post: Post;
    authorProfile?: UserProfile;
    images?: string[];
    onImageClick: (images: string[], index: number) => void;
}

export default function PostCard({ post, authorProfile, images, onImageClick }: PostCardProps): JSX.Element {
    const name = authorProfile?.name ?? authorProfile?.email ?? post.author;
    const pic = authorProfile?.avatar_url;

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentImage, setCommentImage] = useState<File | null>(null);
    const [sendingComment, setSendingComment] = useState(false);
    const [commentAuthors, setCommentAuthors] = useState<Record<string, UserProfile>>({});
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const data = await fetchPostComment(post.id, 50, 1);
            setComments(data.comments);
            
            // Fetch authors for comments
            const uniqueAuthors = [...new Set(data.comments.map((c) => c.user_id))];
            const profiles = await Promise.all(
                uniqueAuthors.map((id) => getUserById(id).then((profile) => [id, profile] as const).catch(() => null))
            );
            
            const map: Record<string, UserProfile> = {};
            for (const r of profiles) {
                if (r) map[r[0]] = r[1];
            }
            setCommentAuthors((prev) => ({ ...prev, ...map }));
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            loadComments();
        }
        setShowComments(!showComments);
    };

    const handleSendComment = async () => {
        if ((!commentText.trim() && !commentImage) || sendingComment) return;
        
        setSendingComment(true);
        try {
            let attachmentArray = new Uint8Array();
            if (commentImage) {
                const arrayBuffer = await commentImage.arrayBuffer();
                attachmentArray = new Uint8Array(arrayBuffer);
            }
            
            const newComment = await createComment(post.id, {
                content: commentText.trim(),
                attachment: attachmentArray,
                reply_to: null,
            });
            
            setComments((prev) => [newComment, ...prev]);
            setCommentText("");
            setCommentImage(null);
            
            // Make sure we have the author profile for the new comment
            if (!commentAuthors[newComment.user_id]) {
                const profile = await getUserById(newComment.user_id).catch(() => null);
                if (profile) {
                    setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: profile }));
                }
            }
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSendingComment(false);
        }
    };

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="sm"
            overflow="hidden"
            _hover={{ boxShadow: "md" }}
            transition="box-shadow 0.15s ease"
        >
            <Box p={5}>
                <Flex align="center" gap={3} mb={3}>
                    <Avatar.Root size="sm" colorPalette="green">
                        {pic ? <Avatar.Image src={pic} /> : null}
                        <Avatar.Fallback name={name ?? undefined} />
                    </Avatar.Root>
                    <Box flex={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                            {name}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                            {new Date(post.created_at).toLocaleString("vi-VN")}
                        </Text>
                    </Box>
                </Flex>

                <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap" lineHeight="1.7">
                    {post.content}
                </Text>

                {images && images.length > 0 && (
                    <PostImageGrid images={images} onImageClick={onImageClick} />
                )}
            </Box>

            <Separator borderColor="gray.100" />

            <Flex px={5} py={2.5} gap={5}>
                <Flex
                    align="center"
                    gap={1.5}
                    color="gray.400"
                    cursor="pointer"
                    _hover={{ color: "red.400" }}
                    transition="color 0.15s"
                    fontSize="sm"
                >
                    <Icon as={LuHeart} boxSize={4} />
                    <Text fontSize="xs">{post.likes}</Text>
                </Flex>
                <Flex
                    align="center"
                    gap={1.5}
                    color={showComments ? "green.500" : "gray.400"}
                    cursor="pointer"
                    _hover={{ color: "green.500" }}
                    transition="color 0.15s"
                    fontSize="sm"
                    onClick={handleToggleComments}
                >
                    <Icon as={LuMessageCircle} boxSize={4} />
                    <Text fontSize="xs">Bình luận</Text>
                </Flex>
            </Flex>

            {showComments && (
                <Box bg="gray.50" p={5} borderTop="1px solid" borderColor="gray.100">
                    <Box mb={5}>
                        <Flex gap={3}>
                            <Input
                                placeholder="Viết bình luận..."
                                size="sm"
                                bg="white"
                                borderRadius="full"
                                color="black"
                                _placeholder={{ color: "gray.400" }}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendComment();
                                }}
                                disabled={sendingComment}
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="gray"
                                borderRadius="full"
                                px={2}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={sendingComment || commentImage !== null}
                            >
                                <Icon as={LuImage} boxSize={5} color={commentImage ? "gray.300" : "gray.500"} />
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setCommentImage(file);
                                    e.target.value = "";
                                }}
                            />
                            <Button 
                                size="sm" 
                                colorScheme="green" 
                                borderRadius="full" 
                                onClick={handleSendComment}
                                disabled={(!commentText.trim() && !commentImage) || sendingComment}
                            >
                                {sendingComment ? <Spinner size="xs" /> : <Icon as={LuSend} />}
                            </Button>
                        </Flex>
                        
                        {commentImage && (
                            <Box mt={3} position="relative" w="fit-content" ml={1}>
                                <Image
                                    src={URL.createObjectURL(commentImage)}
                                    maxH="100px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="gray.200"
                                />
                                <Box
                                    position="absolute"
                                    top="-6px" right="-6px"
                                    bg="gray.600"
                                    borderRadius="full"
                                    p="2px"
                                    cursor="pointer"
                                    onClick={() => setCommentImage(null)}
                                >
                                    <Icon as={LuX} boxSize={3} color="white" />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {loadingComments ? (
                        <Flex justify="center" py={4}>
                            <Spinner size="sm" color="green.500" />
                        </Flex>
                    ) : comments.length === 0 ? (
                        <Text textAlign="center" fontSize="sm" color="gray.400" py={2}>
                            Chưa có bình luận nào. Hãy là người đầu tiên!
                        </Text>
                    ) : (
                        <VStack align="stretch" gap={4}>
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    postId={post.id}
                                    comment={comment}
                                    level={0}
                                    initialAuthorProfile={commentAuthors[comment.user_id]}
                                    onImageClick={onImageClick}
                                />
                            ))}
                        </VStack>
                    )}
                </Box>
            )}
        </Box>
    );
}
