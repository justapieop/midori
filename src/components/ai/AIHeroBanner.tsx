import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { LuBot } from "react-icons/lu";
import { NAVBAR_HEIGHT } from "@/components/Navbar";

export function AIHeroBanner(): JSX.Element {
    return (
        <Box
            pt={NAVBAR_HEIGHT}
            bgGradient="to-br"
            gradientFrom="green.500"
            gradientTo="teal.400"
            px={{ base: 4, md: 8 }}
        >
            <Flex maxW="1200px" mx="auto" py={10} align="center" gap={4}>
                <Box bg="whiteAlpha.200" borderRadius="xl" p={3} color="white">
                    <Icon as={LuBot} boxSize={7} />
                </Box>
                <Box>
                    <Heading size="xl" color="white" fontWeight="bold">
                        Trợ lý AI
                    </Heading>
                    <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                        Hỏi đáp và nhận được hỗ trợ nhanh chóng từ trí tuệ nhân tạo.
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}