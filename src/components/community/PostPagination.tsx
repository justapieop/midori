import type { JSX } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface PostPaginationProps {
    postIndex: number;
    totalPosts: number;
    onIndexChange: (index: number) => void;
}

export default function PostPagination({ postIndex, totalPosts, onIndexChange }: PostPaginationProps): JSX.Element {
    return (
        <Flex align="center" justify="center" gap={4} py={4}>
            <Flex
                as="button"
                aria-disabled={postIndex === 0}
                onClick={() => { if (postIndex !== 0) onIndexChange(postIndex - 1); }}
                w="40px"
                h="40px"
                align="center"
                justify="center"
                bg={postIndex === 0 ? "gray.50" : "white"}
                border="1px solid"
                borderColor={postIndex === 0 ? "gray.100" : "green.200"}
                borderRadius="full"
                cursor={postIndex === 0 ? "not-allowed" : "pointer"}
                opacity={postIndex === 0 ? 0.5 : 1}
                _hover={postIndex === 0 ? {} : { bg: "green.50", borderColor: "green.300", transform: "scale(1.05)" }}
                transition="all 0.2s"
                boxShadow="sm"
            >
                <Icon as={LuChevronLeft} boxSize={5} color={postIndex === 0 ? "gray.400" : "green.600"} />
            </Flex>

            <Flex bg="white" px={4} py={2} borderRadius="full" boxShadow="sm" border="1px solid" borderColor="gray.100" minW="100px" justify="center">
                <Text fontSize="sm" color="gray.600" fontWeight="bold">
                    Bài {postIndex + 1} <Text as="span" color="gray.400" fontWeight="medium" ml={1}>/ {totalPosts}</Text>
                </Text>
            </Flex>

            <Flex
                as="button"
                aria-disabled={postIndex === totalPosts - 1}
                onClick={() => { if (postIndex !== totalPosts - 1) onIndexChange(postIndex + 1); }}
                w="40px"
                h="40px"
                align="center"
                justify="center"
                bg={postIndex === totalPosts - 1 ? "gray.50" : "white"}
                border="1px solid"
                borderColor={postIndex === totalPosts - 1 ? "gray.100" : "green.200"}
                borderRadius="full"
                cursor={postIndex === totalPosts - 1 ? "not-allowed" : "pointer"}
                opacity={postIndex === totalPosts - 1 ? 0.5 : 1}
                _hover={postIndex === totalPosts - 1 ? {} : { bg: "green.50", borderColor: "green.300", transform: "scale(1.05)" }}
                transition="all 0.2s"
                boxShadow="sm"
            >
                <Icon as={LuChevronRight} boxSize={5} color={postIndex === totalPosts - 1 ? "gray.400" : "green.600"} />
            </Flex>
        </Flex>
    );
}
