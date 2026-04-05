import type { JSX } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";

interface PostImageGridProps {
    images: string[];
    onImageClick: (images: string[], index: number) => void;
}

const MAX_VISIBLE = 3;

export default function PostImageGrid({ images, onImageClick }: PostImageGridProps): JSX.Element | null {
    if (images.length === 0) return null;

    const visible = images.slice(0, MAX_VISIBLE);
    const remaining = images.length - MAX_VISIBLE;

    return (
        <Flex gap={2} mt={3} flexWrap="wrap">
            {visible.map((url, i) => (
                <Box
                    key={i}
                    position="relative"
                    cursor="pointer"
                    onClick={() => onImageClick(images, i)}
                >
                    <Image
                        src={url}
                        h="160px"
                        w="160px"
                        objectFit="cover"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.200"
                    />
                    {i === MAX_VISIBLE - 1 && remaining > 0 && (
                        <Flex
                            position="absolute"
                            inset={0}
                            bg="blackAlpha.600"
                            borderRadius="lg"
                            align="center"
                            justify="center"
                        >
                            <Text fontSize="xl" fontWeight="bold" color="white">+{remaining}</Text>
                        </Flex>
                    )}
                </Box>
            ))}
        </Flex>
    );
}
