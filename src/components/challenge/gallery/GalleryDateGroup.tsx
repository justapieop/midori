import type { JSX } from "react";
import { Box, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { LuImageOff } from "react-icons/lu";
import type { DateGroup, GalleryEntry } from "./types";

interface GalleryDateGroupProps {
    group: DateGroup;
    allEntries: GalleryEntry[];
    onImageClick: (globalIndex: number) => void;
}

export function GalleryDateGroup({ group, allEntries, onImageClick }: GalleryDateGroupProps): JSX.Element {
    const hasImages = group.entries.length > 0;

    const shortLabel = group.date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
    });

    return (
        <Box w="130px" flexShrink={0}>
            {/* Date header */}
            <Box
                bg={hasImages ? "green.50" : "gray.50"}
                border="1px solid"
                borderColor={hasImages ? "green.200" : "gray.200"}
                borderRadius="lg"
                px={2}
                py={1.5}
                mb={2}
                textAlign="center"
            >
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color={hasImages ? "green.700" : "gray.400"}
                    textTransform="capitalize"
                    lineClamp={1}
                >
                    {shortLabel}
                </Text>
                {hasImages && (
                    <Text fontSize="2xs" color="green.500" mt={0.5}>
                        {group.entries.length} ảnh
                    </Text>
                )}
            </Box>

            {/* Images or placeholder */}
            {!hasImages ? (
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="100px"
                    borderRadius="lg"
                    border="1.5px dashed"
                    borderColor="gray.200"
                    bg="gray.50"
                    gap={1}
                >
                    <Icon as={LuImageOff} boxSize={5} color="gray.300" />
                    <Text fontSize="2xs" color="gray.400" textAlign="center" px={1}>
                        Chưa có ảnh
                    </Text>
                </Flex>
            ) : (
                <Flex direction="column" gap={1.5}>
                    {group.entries.map((entry) => {
                        const globalIndex = allEntries.findIndex((e) => e.url === entry.url);
                        return (
                            <Box
                                key={entry.url}
                                position="relative"
                                borderRadius="md"
                                overflow="hidden"
                                aspectRatio="1"
                                cursor="pointer"
                                border="2px solid"
                                borderColor="transparent"
                                _hover={{ borderColor: "green.400", transform: "scale(1.03)" }}
                                transition="all 0.15s ease"
                                onClick={() => onImageClick(globalIndex)}
                                title={entry.createdAt.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            >
                                <Image src={entry.url} w="100%" h="100%" objectFit="cover" />

                                {/* Time badge */}
                                <Box
                                    position="absolute"
                                    bottom={1}
                                    right={1}
                                    bg="blackAlpha.600"
                                    borderRadius="md"
                                    px={1.5}
                                    py={0.5}
                                >
                                    <Text fontSize="2xs" color="white" fontWeight="medium">
                                        {entry.createdAt.toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </Box>
                            </Box>
                        );
                    })}
                </Flex>
            )}
        </Box>
    );
}
