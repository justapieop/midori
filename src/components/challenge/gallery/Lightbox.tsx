import { useEffect } from "react";
import type { JSX } from "react";
import { Box, Icon, Image, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import type { GalleryEntry } from "./types";

interface LightboxProps {
    entries: GalleryEntry[];
    index: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

export function Lightbox({ entries, index, onClose, onPrev, onNext }: LightboxProps): JSX.Element {
    const entry = entries[index];

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, onPrev, onNext]);

    return (
        <Box
            position="fixed"
            inset={0}
            zIndex={1400}
            bg="blackAlpha.900"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={onClose}
        >
            {/* Close */}
            <Box
                position="absolute"
                top={4}
                right={4}
                cursor="pointer"
                color="whiteAlpha.800"
                _hover={{ color: "white" }}
                onClick={onClose}
                zIndex={1}
            >
                <Icon as={LuX} boxSize={6} />
            </Box>

            {/* Prev */}
            {index > 0 && (
                <Box
                    position="absolute"
                    left={4}
                    cursor="pointer"
                    color="whiteAlpha.800"
                    _hover={{ color: "white" }}
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    zIndex={1}
                >
                    <Icon as={LuChevronLeft} boxSize={9} />
                </Box>
            )}

            {/* Next */}
            {index < entries.length - 1 && (
                <Box
                    position="absolute"
                    right={4}
                    cursor="pointer"
                    color="whiteAlpha.800"
                    _hover={{ color: "white" }}
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    zIndex={1}
                >
                    <Icon as={LuChevronRight} boxSize={9} />
                </Box>
            )}

            {/* Image */}
            <Box
                maxW="90vw"
                maxH="90vh"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={entry.url}
                    maxW="90vw"
                    maxH="82vh"
                    objectFit="contain"
                    borderRadius="xl"
                />
                <Text
                    textAlign="center"
                    color="whiteAlpha.700"
                    fontSize="sm"
                    mt={3}
                >
                    {entry.createdAt.toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    {" "}·{" "}
                    {index + 1} / {entries.length}
                </Text>
            </Box>
        </Box>
    );
}
