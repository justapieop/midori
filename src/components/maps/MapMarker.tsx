import { Box, Text } from "@chakra-ui/react";

interface MapMarkerProps {
  color?: string;
  size?: number;
  iconSrc?: string;
}

export default function MapMarker({ color = "#E53E3E", size = 40, iconSrc }: MapMarkerProps) {
  const dotSize = size * 0.3;
  const iconSize = size * 0.55;

  return (
    <Box position="relative" display="inline-flex" flexDirection="column" alignItems="center">
      <Box
        width={`${size}px`}
        height={`${size}px`}
        bg={color}
        borderRadius="50% 50% 50% 0"
        transform="rotate(-45deg)"
        boxShadow="0 4px 12px rgba(0,0,0,0.35)"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
        }}
      >
        {/* Icon or fallback dot */}
        {iconSrc ? (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%) rotate(45deg)"
            width={`${iconSize}px`}
            height={`${iconSize}px`}
            borderRadius="full"
            overflow="hidden"
            bg="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={`${iconSize * 0.7}px`} lineHeight={1}>
              {iconSrc}
            </Text>
          </Box>
        ) : (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%) rotate(45deg)"
            width={`${dotSize}px`}
            height={`${dotSize}px`}
            bg="white"
            borderRadius="full"
            opacity={0.9}
          />
        )}
      </Box>

      <Box
        mt="2px"
        width={`${size * 0.45}px`}
        height={`${size * 0.12}px`}
        bg="blackAlpha.300"
        borderRadius="full"
        filter="blur(2px)"
      />
    </Box>
  );
}
