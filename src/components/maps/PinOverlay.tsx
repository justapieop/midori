import { Box, Heading, Text, Badge, IconButton } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import type { Pin } from "@/api/pin";

interface PinOverlayProps {
    pin: Pin;
    onClose: () => void;
}

export default function PinOverlay({ pin, onClose }: PinOverlayProps) {
    return (
        <>
            <Box
                position="fixed"
                inset={0}
                zIndex={1000}
                bg="blackAlpha.400"
                onClick={onClose}
            />

            <Box
                position="fixed"
                zIndex={1001}
                bg="white"
                boxShadow="0 -4px 32px rgba(0,0,0,0.15)"
                p={6}
                /* Mobile: full-width bottom sheet */
                bottom={{ base: 0, md: "auto" }}
                left={{ base: 0, md: "50%" }}
                top={{ base: "auto", md: "50%" }}
                right={{ base: 0, md: "auto" }}
                transform={{ base: "none", md: "translate(-50%, -50%)" }}
                borderRadius={{ base: "2xl 2xl 0 0", md: "xl" }}
                w={{ base: "100%", md: "auto" }}
                minW={{ md: "320px" }}
                maxW={{ md: "480px" }}
                /* Safe area padding for phones with home bar */
                pb={{ base: "calc(1.5rem + env(safe-area-inset-bottom))", md: 6 }}
            >
                {/* Drag handle — visible on mobile only */}
                <Box
                    display={{ base: "block", md: "none" }}
                    mx="auto"
                    mb={4}
                    w="40px"
                    h="4px"
                    bg="gray.300"
                    borderRadius="full"
                />

                <IconButton
                    aria-label="Close"
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top={3}
                    right={3}
                    onClick={onClose}
                >
                    <LuX />
                </IconButton>

                {pin.is_sponsored && (
                    <Badge colorPalette="yellow" mb={3}>
                        Được tài trợ
                    </Badge>
                )}

                <Heading size="md" mb={2} pr={8} color={pin.is_sponsored ? "green.700" : "gray.800"}>
                    {pin.name}
                </Heading>

                <Text color="gray.600" fontSize="sm">
                    {pin.address}
                </Text>
            </Box>
        </>
    );
}
