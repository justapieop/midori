import { Box, Flex, IconButton, Popover, Button, Image, Text, Separator } from "@chakra-ui/react";
import { LuUser, LuLogOut, LuLogIn, LuShield, LuMap, LuCircleUser, LuTrophy } from "react-icons/lu";
import authgear, { SessionState, type WebContainer, type SessionStateChangeReason } from "@authgear/web";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "@/api/user";

export const NAVBAR_HEIGHT = "56px";

async function handleLogin() {
    await authgear.startAuthentication({
        redirectURI: import.meta.env.VITE_AUTHGEAR_REDIRECT_URL,
    });
}

async function handleLogout() {
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
    const [displayName, setDisplayName] = useState<string | undefined>();

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile().then((profile) => {
                setAvatarUrl(profile.picture);
                setIsAdmin(profile.is_admin);
                setDisplayName(profile.name ?? profile.preferredUsername ?? profile.email);
            });
        } else {
            setAvatarUrl(undefined);
            setIsAdmin(false);
            setDisplayName(undefined);
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
                <Image
                    src="/logo.png"
                    alt="Midori"
                    h="36px"
                    objectFit="contain"
                    cursor="pointer"
                    onClick={() => window.location.href = "/"}
                />

                {/* Center nav links */}
                <Flex position="absolute" left="50%" transform="translateX(-50%)" align="center" gap={1}>
                    <Button
                        variant="ghost"
                        size="sm"
                        color="white"
                        _hover={{ bg: "transparent" }}
                        _active={{ bg: "transparent" }}
                        onClick={() => window.location.href = "/"}
                        gap={2}
                    >
                        <LuMap />
                        Bản đồ
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        color="white"
                        _hover={{ bg: "transparent" }}
                        _active={{ bg: "transparent" }}
                        onClick={() => window.location.href = "/challenge"}
                        gap={2}
                        display={isAuthenticated ? undefined : "none"}
                    >
                        <LuTrophy />
                        Thử thách
                    </Button>
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
                        <Popover.Content minW="180px" p={0} bg="white" boxShadow="0 2px 8px rgba(0,0,0,0.10)" overflow="hidden">
                            {isAuthenticated ? (
                                <Flex direction="column">
                                    {/* Profile header */}
                                    <Flex direction="column" align="center" gap={2} pt={4} pb={3} px={4}>
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt="Avatar"
                                                boxSize="56px"
                                                borderRadius="full"
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <Box boxSize="56px" borderRadius="full" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                                <LuUser size={24} />
                                            </Box>
                                        )}
                                        {displayName && (
                                            <Text fontWeight="semibold" fontSize="sm" color="gray.800" textAlign="center">
                                                {displayName}
                                            </Text>
                                        )}
                                    </Flex>
                                    <Separator />
                                    {/* Actions */}
                                    <Flex direction="column" p={1}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            color="black"
                                            _hover={{ bg: "transparent" }}
                                            onClick={() => window.location.href = "/profile"}
                                            gap={2}
                                        >
                                            <LuCircleUser />
                                            Xem hồ sơ
                                        </Button>
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

