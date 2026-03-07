import type { JSX } from "react";
import { Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { LuTrophy } from "react-icons/lu";
import { NAVBAR_HEIGHT } from "@/components/Navbar";

export function ChallengeHeroBanner(): JSX.Element {
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
                    <Icon as={LuTrophy} boxSize={7} />
                </Box>
                <Box>
                    <Heading size="xl" color="white" fontWeight="bold">
                        Thử thách
                    </Heading>
                    <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                        Tham gia các thử thách để kiếm điểm và nâng cao kỹ năng của bạn.
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}
