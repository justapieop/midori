import type { JSX } from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { LuUsers } from "react-icons/lu";

export default function CommunityHeroBanner(): JSX.Element {
    return (
        <Box
            mt="56px"
            bgGradient="to-br"
            gradientFrom="green.600"
            gradientTo="teal.500"
            px={{ base: 4, md: 8 }}
            py={10}
            textAlign="center"
        >
            <Flex justify="center" mb={3}>
                <Flex
                    bg="whiteAlpha.200"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="full"
                    p={3}
                >
                    <Icon as={LuUsers} boxSize={6} color="white" />
                </Flex>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="white" mb={1}>Cộng đồng</Text>
            <Text fontSize="sm" color="whiteAlpha.800">Chia sẻ khoảnh khắc xanh của bạn</Text>
        </Box>
    );
}
