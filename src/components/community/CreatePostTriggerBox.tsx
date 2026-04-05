import type { JSX } from "react";
import { Box, Text } from "@chakra-ui/react";

interface CreatePostTriggerBoxProps {
    onClick: () => void;
}

export default function CreatePostTriggerBox({ onClick }: CreatePostTriggerBoxProps): JSX.Element {
    return (
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
                    onClick={onClick}
                >
                    <Text fontSize="sm" color="gray.400">
                        Bạn đang nghĩ gì?
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}
