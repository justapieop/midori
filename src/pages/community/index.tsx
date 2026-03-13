import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Icon, Spinner, Text } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight, LuUsers } from "react-icons/lu";
import Navbar from "@/components/Navbar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { getAllPosts, getPostAttachments } from "@/api/post";
import type { Post } from "@/api/post";
import { fetchUserProfile, getUserById } from "@/api/user";
import type { UserProfile } from "@/api/user";
import { fetchUserAssets } from "@/api/file";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import PostCard from "@/components/community/PostCard";
import ImageGalleryLightbox from "@/components/community/ImageGalleryLightbox";


export default function CommunityPage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [authorProfiles, setAuthorProfiles] = useState<Record<string, UserProfile>>({});
    const [postImages, setPostImages] = useState<Record<string, string[]>>({});
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [postIndex, setPostIndex] = useState(0);

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }
        setChecking(false);
        fetchUserProfile().then((profile) => {
            setAuthorProfiles((prev) => ({ ...prev, [profile.id]: profile }));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (checking) return;
        setLoadingPosts(true);
        getAllPosts(100, 1)
            .then((data) => {
                console.log("getAllPosts result:", data);
                setPosts(data.posts);
                const uniqueAuthors = [...new Set(data.posts.map((p) => p.author))];
                Promise.all(
                    uniqueAuthors.map((id) => getUserById(id).then((profile) => [id, profile] as const).catch(() => null))
                ).then((results) => {
                    const map: Record<string, UserProfile> = {};
                    for (const r of results) {
                        if (r) map[r[0]] = r[1];
                    }
                    setAuthorProfiles((prev) => ({ ...prev, ...map }));
                });
                for (const post of data.posts) {
                    getPostAttachments(post.id).then((attachments) => {
                        if (attachments.length === 0) return;
                        const urls = attachments.map((att) => fetchUserAssets(post.author, att));
                        setPostImages((prev) => ({ ...prev, [post.id]: urls }));
                    }).catch(() => {});
                }
            })
            .catch(() => setPosts([]))
            .finally(() => setLoadingPosts(false));
    }, [checking]);

    const openGallery = (images: string[], index: number) => {
        setGalleryImages(images);
        setGalleryIndex(index);
    };

    if (checking) {
        return <LoadingScreen icon={LuUsers} message="Đang tải cộng đồng..." />;
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />

            {/* Hero banner */}
            <Box
                mt="56px"
                bgGradient="to-br"
                gradientFrom="green.600"
                gradientTo="teal.500"
                px={{ base: 4, md: 8 }}
                py={10}
                textAlign="center"
            >
                <Flex justify="center" mb={3}>
                    <Flex
                        bg="whiteAlpha.200"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        borderRadius="full"
                        p={3}
                    >
                        <Icon as={LuUsers} boxSize={6} color="white" />
                    </Flex>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" color="white" mb={1}>Cộng đồng</Text>
                <Text fontSize="sm" color="whiteAlpha.800">Chia sẻ khoảnh khắc xanh của bạn</Text>
            </Box>

            <Box px={{ base: 4, md: 8 }} maxW="680px" mx="auto" py={6}>
                {/* Create post box */}
                <Box
                    bg="white"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.200"
                    boxShadow="sm"
                    overflow="hidden"
                    mb={6}
                >
                    <Box h="3px" bgGradient="to-r" gradientFrom="green.400" gradientTo="teal.400" />
                    <Box p={5}>
                        <Box
                            px={4}
                            py={3}
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            bg="gray.50"
                            cursor="pointer"
                            _hover={{ borderColor: "green.300", bg: "white" }}
                            transition="all 0.15s"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Text fontSize="sm" color="gray.400">
                                Bạn đang nghĩ gì?
                            </Text>
                        </Box>
                    </Box>
                </Box>

                <CreatePostDialog
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onPostCreated={(newPosts, newImages) => {
                        setPosts(newPosts);
                        setPostImages((prev) => ({ ...prev, ...newImages }));
                    }}
                />

                {loadingPosts ? (
                    <Flex justify="center" py={20}>
                        <Spinner color="green.500" />
                    </Flex>
                ) : posts.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={20} gap={3} color="gray.400">
                        <Icon as={LuUsers} boxSize={10} />
                        <Text fontSize="md" fontWeight="medium">Chưa có bài viết nào.</Text>
                        <Text fontSize="sm">Hãy là người đầu tiên chia sẻ</Text>
                    </Flex>
                ) : (
                    <Flex direction="column" gap={4}>
                        <PostCard
                            post={posts[postIndex]}
                            authorProfile={authorProfiles[posts[postIndex].author]}
                            images={postImages[posts[postIndex].id]}
                            onImageClick={openGallery}
                        />
                        <Flex align="center" justify="center" gap={3}>
                            <Box
                                as="button"
                                _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                                aria-disabled={postIndex === 0}
                                onClick={() => { if (postIndex !== 0) setPostIndex((i) => i - 1); }}
                                bg="white"
                                border="1px solid"
                                borderColor={postIndex === 0 ? "gray.200" : "green.300"}
                                borderRadius="full"
                                p={2}
                                cursor={postIndex === 0 ? "not-allowed" : "pointer"}
                                opacity={postIndex === 0 ? 0.4 : 1}
                                _hover={postIndex === 0 ? {} : { bg: "green.50" }}
                                transition="all 0.15s"
                            >
                                <Icon as={LuChevronLeft} boxSize={5} color={postIndex === 0 ? "gray.400" : "green.500"} />
                            </Box>
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                {postIndex + 1} / {posts.length}
                            </Text>
                            <Box
                                as="button"
                                _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                                aria-disabled={postIndex === posts.length - 1}
                                onClick={() => { if (postIndex !== posts.length - 1) setPostIndex((i) => i + 1); }}
                                bg="white"
                                border="1px solid"
                                borderColor={postIndex === posts.length - 1 ? "gray.200" : "green.300"}
                                borderRadius="full"
                                p={2}
                                cursor={postIndex === posts.length - 1 ? "not-allowed" : "pointer"}
                                opacity={postIndex === posts.length - 1 ? 0.4 : 1}
                                _hover={postIndex === posts.length - 1 ? {} : { bg: "green.50" }}
                                transition="all 0.15s"
                            >
                                <Icon as={LuChevronRight} boxSize={5} color={postIndex === posts.length - 1 ? "gray.400" : "green.500"} />
                            </Box>
                        </Flex>
                    </Flex>
                )}
            </Box>

            <ImageGalleryLightbox
                images={galleryImages}
                index={galleryIndex}
                onIndexChange={setGalleryIndex}
                onClose={() => setGalleryImages([])}
            />
        </Box>
    );
}
