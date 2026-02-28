import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Flex, Heading, Spinner, Text, Button, Grid, GridItem, Icon } from "@chakra-ui/react";
import authgear, { SessionState } from "@authgear/web";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "@/api/user";
import { LuArrowLeft, LuTrophy } from "react-icons/lu";

export default function AdminPage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }

        fetchUserProfile()
            .then((profile) => {
                if (!profile.is_admin) {
                    navigate("/");
                } else {
                    setChecking(false);
                }
            })
            .catch(() => navigate("/"));
    }, []);

    if (checking) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="gray.50">
                <Spinner size="lg" />
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Box
                pt="2rem"
                px={{ base: 4, md: 8 }}
                maxW="1200px"
                mx="auto"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    color="gray.600"
                    _hover={{ bg: "gray.100" }}
                    mb={6}
                    gap={2}
                    onClick={() => navigate("/")}
                >
                    <LuArrowLeft />
                    Trang chủ
                </Button>

                <Heading size="lg" mb={6} color="gray.800">
                    Quản trị
                </Heading>

                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                    <GridItem>
                        <Box
                            bg="white"
                            borderRadius="xl"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor="gray.200"
                            p={6}
                            cursor="pointer"
                            _hover={{ boxShadow: "md", borderColor: "green.300" }}
                            transition="all 0.15s"
                            onClick={() => navigate("/admin/challenge")}
                        >
                            <Flex align="center" gap={3} mb={3}>
                                <Box
                                    bg="green.50"
                                    borderRadius="lg"
                                    p={2}
                                    color="green.600"
                                >
                                    <Icon as={LuTrophy} boxSize={5} />
                                </Box>
                                <Heading size="sm" color="gray.800">Quản lý thử thách</Heading>
                            </Flex>
                            <Text fontSize="sm" color="gray.500">
                                Tạo, chỉnh sửa và xoá các thử thách trong hệ thống.
                            </Text>
                        </Box>
                    </GridItem>
                </Grid>
            </Box>
        </Box>
    );
}
