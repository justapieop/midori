import type { JSX, ReactNode } from "react";
import { Flex, Text } from "@chakra-ui/react";

export function StatChip({
    icon,
    label,
    bg = "gray.50",
    borderColor = "gray.200",
    color = "gray.600",
    fontSize = "xs",
}: {
    icon: ReactNode;
    label: string;
    bg?: string;
    borderColor?: string;
    color?: string;
    fontSize?: string;
}): JSX.Element {
    return (
        <Flex
            align="center"
            gap={1.5}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            px={3}
            py={1}
            fontSize={fontSize}
            color={color}
            fontWeight="medium"
        >
            {icon}
            <Text>{label}</Text>
        </Flex>
    );
}
