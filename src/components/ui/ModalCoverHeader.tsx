import type { JSX } from "react";
import { Box, Button, Dialog, Flex, Heading, Icon, Image } from "@chakra-ui/react";
import { LuTrophy, LuX } from "react-icons/lu";

export function ModalCoverHeader({
    title,
    coverUrl,
}: {
    title: string;
    coverUrl?: string;
}): JSX.Element {
    return (
        <Box position="relative" h="220px" flexShrink={0}>
            {coverUrl ? (
                <Image src={coverUrl} alt={title} w="100%" h="100%" objectFit="cover" />
            ) : (
                <Flex w="100%" h="100%" bg="gray.100" align="center" justify="center" color="gray.300">
                    <Icon as={LuTrophy} boxSize={12} />
                </Flex>
            )}
            <Box
                position="absolute"
                inset={0}
                bgGradient="to-t"
                gradientFrom="blackAlpha.700"
                gradientTo="transparent"
            />
            <Box position="absolute" bottom={4} left={5} right={12}>
                <Heading size="lg" color="white" lineClamp={2} textShadow="0 1px 4px rgba(0,0,0,0.5)">
                    {title}
                </Heading>
            </Box>
            <Dialog.CloseTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top={3}
                    right={3}
                    color="white"
                    _hover={{ bg: "blackAlpha.300" }}
                    p={1}
                    minW={0}
                >
                    <LuX />
                </Button>
            </Dialog.CloseTrigger>
        </Box>
    );
}
