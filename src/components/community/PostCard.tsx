import type { JSX } from "react";
import { Avatar, Box, Flex, Icon, Separator, Text } from "@chakra-ui/react";
import { LuHeart, LuMessageCircle } from "react-icons/lu";
import type { Post } from "@/api/post";
import type { UserProfile } from "@/api/user";
import PostImageGrid from "./PostImageGrid";

interface PostCardProps {
    post: Post;
    authorProfile?: UserProfile;
    images?: string[];
    onImageClick: (images: string[], index: number) => void;
}

export default function PostCard({ post, authorProfile, images, onImageClick }: PostCardProps): JSX.Element {
    const name = authorProfile?.name ?? authorProfile?.email ?? post.author;
    const pic = authorProfile?.avatar_url;

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
                    color="gray.400"
                    cursor="pointer"
                    _hover={{ color: "green.500" }}
                    transition="color 0.15s"
                    fontSize="sm"
                >
                    <Icon as={LuMessageCircle} boxSize={4} />
                    <Text fontSize="xs">Bình luận</Text>
                </Flex>
            </Flex>
        </Box>
    );
}
