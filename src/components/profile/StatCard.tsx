import type { JSX } from "react";
import { Flex, Text } from "@chakra-ui/react";

export function StatCard({ icon, label, value }: { icon: JSX.Element; label: string; value: string | number }): JSX.Element {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="2xl"
            p={5}
            gap={2}
            flex={1}
            minW="120px"
            boxShadow="sm"
        >
            <Flex
                bg="green.50"
                border="1px solid"
                borderColor="green.100"
                borderRadius="full"
                p={2}
                color="green.500"
            >
                {icon}
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">{value}</Text>
            <Text fontSize="xs" color="gray.500" textAlign="center">{label}</Text>
        </Flex>
    );
}
