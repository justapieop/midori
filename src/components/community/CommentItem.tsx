import { useState, useRef } from "react";
import type { JSX } from "react";
import { Avatar, Box, Flex, Text, Input, Button, Spinner, Image, Icon, VStack } from "@chakra-ui/react";
import { LuImage, LuSend, LuX, LuChevronRight } from "react-icons/lu";
import type { Comment } from "@/api/comment";
import { fetchReplyFromComment, createReply } from "@/api/comment";
import { getUserById, type UserProfile } from "@/api/user";
import { fetchUserAssets } from "@/api/file";

interface CommentItemProps {
    postId: string;
    comment: Comment;
    level?: number;
    replyToName?: string;
    initialAuthorProfile?: UserProfile;
    onImageClick: (images: string[], index: number) => void;
}

export default function CommentItem({ postId, comment, level = 0, replyToName, initialAuthorProfile, onImageClick }: CommentItemProps): JSX.Element {
    const [authorProfile, setAuthorProfile] = useState<UserProfile | undefined>(initialAuthorProfile);
    
    // Lazy load author if not provided initially
    if (!authorProfile && comment.user_id) {
        getUserById(comment.user_id).then(setAuthorProfile).catch(() => {});
    }

    const authorName = authorProfile?.name ?? authorProfile?.email ?? comment.user_id;
    const authorPic = authorProfile?.avatar_url;

    const [replies, setReplies] = useState<Comment[]>([]);
    const [repliesLoaded, setRepliesLoaded] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyImage, setReplyImage] = useState<File | null>(null);
    const [sendingReply, setSendingReply] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadReplies = async () => {
        if (repliesLoaded) return;
        setLoadingReplies(true);
        try {
            const data = await fetchReplyFromComment(postId, comment.id, 50, 1);
            setReplies(data.comments);
            setRepliesLoaded(true);
        } catch (error) {
            console.error("Failed to fetch replies", error);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleToggleReplies = () => {
        if (!showReplies) {
            loadReplies();
        }
        setShowReplies(!showReplies);
    };

    const handleSendReply = async () => {
        if ((!replyText.trim() && !replyImage) || sendingReply) return;
        
        setSendingReply(true);
        try {
            let attachmentArray = new Uint8Array();
            if (replyImage) {
                const arrayBuffer = await replyImage.arrayBuffer();
                attachmentArray = new Uint8Array(arrayBuffer);
            }
            
            const newReply = await createReply(postId, {
                content: replyText.trim(),
                attachment: attachmentArray,
                reply_to: comment.id,
            });
            
            setReplies((prev) => [newReply, ...prev]);
            setReplyText("");
            setReplyImage(null);
            setIsReplying(false);
            setShowReplies(true); // Auto show replies when you post one
        } catch (error) {
            console.error("Failed to post reply", error);
        } finally {
            setSendingReply(false);
        }
    };

    return (
        <Box mt={level === 0 ? 0 : 3} ml={level >= 2 ? "-36px" : 0} position="relative">
            {/* Tree branch horizontal line pointing to this comment's avatar (only for level 1) */}
            {level === 1 && (
                <Box 
                    position="absolute"
                    left="-24px" 
                    top="12px" /* Centers vertically with the 24px Avatar */
                    w="24px" 
                    h="2px"
                    bg="gray.200"
                    borderBottomLeftRadius="md"
                    zIndex={0}
                />
            )}
            <Flex gap={3} position="relative" zIndex={2}>
                <Avatar.Root size="xs" colorPalette="green">
                    {authorPic ? <Avatar.Image src={authorPic} /> : null}
                    <Avatar.Fallback name={authorName} />
                </Avatar.Root>
                <Box flex={1}>
                    <Box bg="white" p={3} borderRadius="xl" border="1px solid" borderColor="gray.200">
                        <Flex align="center" gap={1} mb={1}>
                            <Text fontSize="xs" fontWeight="bold" color="gray.800">
                                {authorName}
                            </Text>
                            {replyToName && level >= 2 && (
                                <>
                                    <Icon as={LuChevronRight} boxSize={3} color="gray.400" />
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500">
                                        {replyToName}
                                    </Text>
                                </>
                            )}
                        </Flex>
                        {comment.content && (
                            <Text fontSize="sm" color="gray.700" mb={comment.attachment_id ? 2 : 0}>
                                {comment.content}
                            </Text>
                        )}
                        {comment.attachment_id && (
                            <Image 
                                src={fetchUserAssets(comment.user_id, comment.attachment_id)}
                                maxH="200px"
                                borderRadius="md"
                                objectFit="contain"
                                cursor="pointer"
                                onClick={() => onImageClick([fetchUserAssets(comment.user_id, comment.attachment_id as string)], 0)}
                            />
                        )}
                    </Box>
                    <Flex gap={4} mt={1} ml={1}>
                        <Text 
                            fontSize="xs" 
                            color="gray.500" 
                            cursor="pointer" 
                            _hover={{ color: "green.500" }}
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            Phản hồi
                        </Text>
                        <Text 
                            fontSize="xs" 
                            color="gray.500" 
                            cursor="pointer" 
                            _hover={{ color: "green.500" }}
                            onClick={handleToggleReplies}
                        >
                            {showReplies ? "Ẩn phản hồi" : "Xem phản hồi"}
                        </Text>
                    </Flex>

                    {isReplying && (
                        <Box mt={2}>
                            <Flex gap={2}>
                                <Input
                                    placeholder="Viết phản hồi..."
                                    size="xs"
                                    bg="white"
                                    borderRadius="full"
                                    color="black"
                                    _placeholder={{ color: "gray.400" }}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendReply();
                                    }}
                                    disabled={sendingReply}
                                />
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="gray"
                                    borderRadius="full"
                                    px={2}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={sendingReply || replyImage !== null}
                                >
                                    <Icon as={LuImage} boxSize={4} color={replyImage ? "gray.300" : "gray.500"} />
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setReplyImage(file);
                                        e.target.value = "";
                                    }}
                                />
                                <Button 
                                    size="xs" 
                                    colorScheme="green" 
                                    borderRadius="full" 
                                    onClick={handleSendReply}
                                    disabled={(!replyText.trim() && !replyImage) || sendingReply}
                                >
                                    {sendingReply ? <Spinner size="xs" /> : <Icon as={LuSend} boxSize={3} />}
                                </Button>
                            </Flex>
                            {replyImage && (
                                <Box mt={2} position="relative" w="fit-content" ml={1}>
                                    <Image
                                        src={URL.createObjectURL(replyImage)}
                                        maxH="80px"
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
                                        onClick={() => setReplyImage(null)}
                                    >
                                        <Icon as={LuX} boxSize={3} color="white" />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {showReplies && (
                        <Box mt={3} position="relative">
                            {/* Vertical tree thread line */}
                            {replies.length > 0 && (
                                <Box 
                                    position="absolute" 
                                    left="-23px" /* Align with center of the Avatar (24px left + 12px center = -24px roughly) */
                                    top="-24px" /* Start from right below the parent avatar */
                                    bottom="16px" 
                                    w="2px" 
                                    bg="gray.200" 
                                    zIndex={0}
                                />
                            )}
                            {loadingReplies ? (
                                <Flex justify="center" py={2}>
                                    <Spinner size="xs" color="green.500" />
                                </Flex>
                            ) : replies.length === 0 ? (
                                <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
                                    Chưa có phản hồi nào
                                </Text>
                            ) : (
                                <VStack align="stretch" gap={0}>
                                    {replies.map((reply) => (
                                        <CommentItem 
                                            key={reply.id} 
                                            postId={postId} 
                                            comment={reply} 
                                            level={level + 1}
                                            replyToName={authorName}
                                            onImageClick={onImageClick} 
                                        />
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    )}
                </Box>
            </Flex>
        </Box>
    );
}