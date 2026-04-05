import type { JSX } from "react";
import { Box, Flex, Icon, Spinner, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";

/**
 * variant="fixed"  – overlays a fixed region (e.g. the map below the navbar).
 *                    Requires `top` to be set to the navbar height offset.
 * variant="full"   – fills the entire viewport height (default, for page-level loading).
 */
export function LoadingScreen({
    icon,
    message,
    variant = "full",
    top = 0,
}: {
    icon: IconType;
    message: string;
    variant?: "fixed" | "full";
    top?: string | number;
}): JSX.Element {
    if (variant === "fixed") {
        return (
            <Box
                position="fixed"
                top={top}
                left={0}
                right={0}
                bottom={0}
                bg="white"
                zIndex={10}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <LoadingContent icon={icon} message={message} />
            </Box>
        );
    }

    return (
        <Flex h="100vh" align="center" justify="center" bg="gray.50">
            <LoadingContent icon={icon} message={message} />
        </Flex>
    );
}

function LoadingContent({ icon, message }: { icon: IconType; message: string }): JSX.Element {
    return (
        <Flex direction="column" align="center" gap={5}>
            <Box
                bg="green.50"
                border="1px solid"
                borderColor="green.200"
                borderRadius="2xl"
                p={5}
                color="green.500"
            >
                <Icon as={icon} boxSize={10} />
            </Box>
            <Spinner size="md" color="green.400" />
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                {message}
            </Text>
        </Flex>
    );
}
