import { Box, Flex, Heading, IconButton, Popover, Button, Image } from "@chakra-ui/react";
import { LuMapPin, LuUser, LuLogOut, LuLogIn, LuShield } from "react-icons/lu";
import authgear, { SessionState, type WebContainer, type SessionStateChangeReason } from "@authgear/web";
import { useState, useEffect } from "react";
import { Cookies } from "react-cookie";
import { fetchUserProfile } from "@/api/user";

export const NAVBAR_HEIGHT = "56px";

async function handleLogin() {
    await authgear.startAuthentication({
        redirectURI: import.meta.env.VITE_AUTHGEAR_REDIRECT_URL,
    });
}

async function handleLogout() {
    const cookies = new Cookies();
    cookies.remove("access-token", { path: "/" });
    await authgear.logout({
        redirectURI: window.location.origin + "/",
    });
    window.location.href = "/";
}

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        authgear.sessionState === SessionState.Authenticated
    );
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile().then((profile) => {
                setAvatarUrl(profile.picture);
                setIsAdmin(profile.is_admin);
            });
        } else {
            setAvatarUrl(undefined);
            setIsAdmin(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const prev = authgear.delegate;
        authgear.delegate = {
            ...prev,
            onSessionStateChange: (container: WebContainer, reason: SessionStateChangeReason) => {
                setIsAuthenticated(container.sessionState === SessionState.Authenticated);
                prev?.onSessionStateChange?.(container, reason);
            },
        };
        return () => { authgear.delegate = prev; };
    }, []);

    return (
        <Box
            as="nav"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={900}
            h={NAVBAR_HEIGHT}
            bg="#4a7c59"
            boxShadow="0 1px 8px rgba(0,0,0,0.15)"
            px={4}
        >
            <Flex h="100%" align="center" justify="space-between">
                <Flex align="center" gap={2}>
                    <LuMapPin size={20} color="white" />
                    <Heading size="sm" letterSpacing="tight" color="white">
                        Midori
                    </Heading>
                </Flex>

                <Popover.Root positioning={{ placement: "bottom-end" }}>
                    <Popover.Trigger asChild>
                        <IconButton
                            aria-label="Profile"
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            _hover={{ bg: "transparent" }}
                            _active={{ bg: "transparent" }}
                        >
                            {isAuthenticated && avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Avatar"
                                    boxSize="28px"
                                    borderRadius="full"
                                    objectFit="cover"
                                />
                            ) : (
                                <LuUser />
                            )}
                        </IconButton>
                    </Popover.Trigger>
                    <Popover.Positioner>
                        <Popover.Content w="auto" p={2} bg="white" boxShadow="0 2px 8px rgba(0,0,0,0.10)">
                            {isAuthenticated ? (
                                <Flex direction="column">
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            color="black"
                                            _hover={{ bg: "transparent" }}
                                            onClick={() => window.location.href = "/admin"}
                                            gap={2}
                                        >
                                            <LuShield />
                                            Quản trị
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        color="red.500"
                                        _hover={{ bg: "transparent" }}
                                        onClick={handleLogout}
                                        gap={2}
                                    >
                                        <LuLogOut />
                                        Đăng xuất
                                    </Button>
                                </Flex>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    color="black"
                                    _hover={{ bg: "transparent" }}
                                    onClick={handleLogin}
                                    gap={2}
                                >
                                    <LuLogIn />
                                    Đăng nhập
                                </Button>
                            )}
                        </Popover.Content>
                    </Popover.Positioner>
                </Popover.Root>
            </Flex>
        </Box>
    );
}

