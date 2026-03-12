import type { JSX } from "react";
import { Box, Dialog, Flex, Icon, Image, Portal, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

interface ImageGalleryLightboxProps {
    images: string[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
}

export default function ImageGalleryLightbox({ images, index, onIndexChange, onClose }: ImageGalleryLightboxProps): JSX.Element {
    const count = images.length;

    return (
        <Dialog.Root open={count > 0} onOpenChange={(d) => { if (!d.open) onClose(); }} size="full">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.800" />
                <Dialog.Positioner>
                    <Dialog.Content bg="transparent" boxShadow="none" maxW="100vw" maxH="100vh">
                        <Flex align="center" justify="center" h="100vh" position="relative">
                            <Box
                                position="absolute"
                                top={4}
                                right={4}
                                cursor="pointer"
                                onClick={onClose}
                                zIndex={10}
                                bg="blackAlpha.500"
                                borderRadius="full"
                                p={2}
                                _hover={{ bg: "blackAlpha.700" }}
                            >
                                <Icon as={LuX} boxSize={6} color="white" />
                            </Box>

                            {count > 1 && (
                                <Box
                                    position="absolute"
                                    left={4}
                                    cursor="pointer"
                                    onClick={() => onIndexChange((index - 1 + count) % count)}
                                    zIndex={10}
                                    bg="blackAlpha.500"
                                    borderRadius="full"
                                    p={2}
                                    _hover={{ bg: "blackAlpha.700" }}
                                >
                                    <Icon as={LuChevronLeft} boxSize={8} color="white" />
                                </Box>
                            )}

                            {images[index] && (
                                <Image
                                    src={images[index]}
                                    maxH="85vh"
                                    maxW="90vw"
                                    objectFit="contain"
                                    borderRadius="lg"
                                />
                            )}

                            {count > 1 && (
                                <Box
                                    position="absolute"
                                    right={4}
                                    cursor="pointer"
                                    onClick={() => onIndexChange((index + 1) % count)}
                                    zIndex={10}
                                    bg="blackAlpha.500"
                                    borderRadius="full"
                                    p={2}
                                    _hover={{ bg: "blackAlpha.700" }}
                                >
                                    <Icon as={LuChevronRight} boxSize={8} color="white" />
                                </Box>
                            )}

                            {count > 1 && (
                                <Text
                                    position="absolute"
                                    bottom={4}
                                    color="white"
                                    fontSize="sm"
                                    bg="blackAlpha.500"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                >
                                    {index + 1} / {count}
                                </Text>
                            )}
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
