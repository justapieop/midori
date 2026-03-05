import type { JSX, ReactNode } from "react";
import { Flex, Text } from "@chakra-ui/react";

export function StatChip({ icon, label }: { icon: ReactNode; label: string }): JSX.Element {
    return (
        <Flex
            align="center"
            gap={1.5}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            color="gray.600"
            fontWeight="medium"
        >
            {icon}
            <Text>{label}</Text>
        </Flex>
    );
}
