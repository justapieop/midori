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
                onClick={onClose}
            />

            <Box
                position="fixed"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex={1001}
                bg="white"
                borderRadius="xl"
                boxShadow="0 8px 32px rgba(0,0,0,0.18)"
                p={6}
                minW="320px"
                maxW="480px"
                w="90vw"
            >
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
                    <Badge
                        colorPalette="yellow"
                        mb={3}
                    >
                        Được tài trợ
                    </Badge>
                )}

                <Heading size="md" mb={2} pr={6} color={pin.is_sponsored ? "green.700" : "gray.800"}>
                    {pin.name}
                </Heading>

                <Text color="gray.600" fontSize="sm">
                    {pin.address}
                </Text>
            </Box>
        </>
    );
}
