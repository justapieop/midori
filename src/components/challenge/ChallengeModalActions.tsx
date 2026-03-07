import type { JSX } from "react";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

export function ChallengeModalActions({
    isJoined,
    hasJoinedChallenge,
    joinable,
    onCompleteClick,
    onWithdrawClick,
    onJoinClick,
}: {
    isJoined: boolean;
    hasJoinedChallenge: boolean;
    joinable: boolean;
    onCompleteClick: () => void;
    onWithdrawClick: () => void;
    onJoinClick: () => void;
}): JSX.Element {
    if (isJoined) {
        return (
            <Flex gap={3} direction={{ base: "column", sm: "row" }}>
                <Button
                    colorPalette="green"
                    flex={1}
                    size="lg"
                    borderRadius="xl"
                    bgGradient="to-r"
                    gradientFrom="green.400"
                    gradientTo="teal.400"
                    color="white"
                    fontWeight="semibold"
                    _hover={{ gradientFrom: "green.500", gradientTo: "teal.500" }}
                    onClick={onCompleteClick}
                >
                    Hoàn thành thử thách
                </Button>
                <Button
                    colorPalette="red"
                    flex={1}
                    size="lg"
                    borderRadius="xl"
                    variant="outline"
                    fontWeight="semibold"
                    onClick={onWithdrawClick}
                >
                    Rút khỏi thử thách
                </Button>
            </Flex>
        );
    }

    if (hasJoinedChallenge) {
        return (
            <Flex
                align="center"
                gap={2}
                justify="center"
                bg="orange.50"
                border="1px solid"
                borderColor="orange.200"
                borderRadius="xl"
                px={4}
                py={3}
            >
                <Icon as={LuTriangleAlert} color="orange.400" boxSize={4} flexShrink={0} />
                <Text fontSize="sm" color="orange.600" fontWeight="medium">
                    Bạn đang tham gia một thử thách khác. Hãy rút khỏi thử thách đó trước.
                </Text>
            </Flex>
        );
    }

    if (joinable) {
        return (
            <Button
                colorPalette="green"
                w="100%"
                size="lg"
                borderRadius="xl"
                bgGradient="to-r"
                gradientFrom="green.400"
                gradientTo="teal.400"
                color="white"
                fontWeight="semibold"
                _hover={{ gradientFrom: "green.500", gradientTo: "teal.500" }}
                onClick={onJoinClick}
            >
                Tham gia thử thách
            </Button>
        );
    }

    return (
        <Flex
            align="center"
            gap={2}
            justify="center"
            bg="orange.50"
            border="1px solid"
            borderColor="orange.200"
            borderRadius="xl"
            px={4}
            py={3}
        >
            <Icon as={LuTriangleAlert} color="orange.400" boxSize={4} flexShrink={0} />
            <Text fontSize="sm" color="orange.600" fontWeight="medium">
                Thử thách sắp diễn ra chưa thể tham gia.
            </Text>
        </Flex>
    );
}
