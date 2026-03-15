import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Icon, Spinner, Text } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { LuUsers } from "react-icons/lu";
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
import CommunityHeroBanner from "@/components/community/CommunityHeroBanner";
import CreatePostTriggerBox from "@/components/community/CreatePostTriggerBox";
import PostPagination from "@/components/community/PostPagination";


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
                setPosts(data.posts.reverse());
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

            <CommunityHeroBanner />

            <Box px={{ base: 4, md: 8 }} maxW="680px" mx="auto" py={6}>
                <CreatePostTriggerBox onClick={() => setCreateOpen(true)} />

                <CreatePostDialog
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onPostCreated={(newPosts, newImages) => {
                        setPosts(newPosts.reverse());
                        setPostImages((prev) => ({ ...prev, ...newImages }));
                        setPostIndex(0);
                    }}
                />

                {loadingPosts ? (
                    <Flex justify="center" py={20}>
                        <Spinner color="green.500" />
                    </Flex>
                ) : posts.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={20} gap={4} bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                        <Box p={4} bg="gray.50" borderRadius="full">
                            <Icon as={LuUsers} boxSize={12} color="gray.400" />
                        </Box>
                        <Flex direction="column" align="center" gap={1}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.700">Chưa có bài viết nào</Text>
                            <Text fontSize="sm" color="gray.500">Hãy là người đầu tiên chia sẻ khoảnh khắc tuyệt vời của bạn!</Text>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex direction="column" gap={4}>
                        <PostCard
                            post={posts[postIndex]}
                            authorProfile={authorProfiles[posts[postIndex].author]}
                            images={postImages[posts[postIndex].id]}
                            onImageClick={openGallery}
                        />
                        <PostPagination
                            postIndex={postIndex}
                            totalPosts={posts.length}
                            onIndexChange={setPostIndex}
                        />
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
