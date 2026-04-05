import type { JSX } from "react";
import { Box, Button, Dialog, Flex, Heading, Icon, Portal, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import type { IconType } from "react-icons";

export function ConfirmDialog({
    open,
    onClose,
    icon,
    iconBg,
    iconBorderColor,
    iconColor,
    title,
    description,
    warning,
    cancelLabel = "Hủy",
    cancelColorPalette,
    confirmLabel,
    confirmColorPalette = "green",
    useGradient = false,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    icon: IconType;
    iconBg: string;
    iconBorderColor: string;
    iconColor: string;
    title: string;
    description: string;
    warning?: string;
    cancelLabel?: string;
    cancelColorPalette?: string;
    confirmLabel: string;
    confirmColorPalette?: string;
    useGradient?: boolean;
    onConfirm: () => void;
}): JSX.Element {
    return (
        <Dialog.Root open={open} onOpenChange={(d) => { if (!d.open) onClose(); }} size="sm">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" bg="white" boxShadow="2xl" p={6}>
                        <Flex direction="column" align="center" textAlign="center" gap={4}>
                            <Flex
                                bg={iconBg}
                                border="1px solid"
                                borderColor={iconBorderColor}
                                borderRadius="full"
                                p={3}
                                color={iconColor}
                            >
                                <Icon as={icon} boxSize={6} />
                            </Flex>
                            <Box>
                                <Heading size="md" color="gray.800" mb={2}>{title}</Heading>
                                <Text fontSize="sm" color="gray.500" lineHeight="tall">{description}</Text>
                                {warning && (
                                    <Flex
                                        align="center"
                                        gap={2}
                                        mt={3}
                                        bg="orange.50"
                                        border="1px solid"
                                        borderColor="orange.200"
                                        borderRadius="lg"
                                        px={3}
                                        py={2}
                                    >
                                        <Icon as={LuTriangleAlert} color="orange.400" boxSize={4} flexShrink={0} />
                                        <Text fontSize="xs" color="orange.600" fontWeight="medium" textAlign="left">
                                            {warning}
                                        </Text>
                                    </Flex>
                                )}
                            </Box>
                            <Flex gap={3} w="100%" mt={2}>
                                <Button
                                    flex={1}
                                    variant="outline"
                                    borderRadius="xl"
                                    colorPalette={cancelColorPalette}
                                    onClick={onClose}
                                >
                                    {cancelLabel}
                                </Button>
                                <Button
                                    flex={1}
                                    colorPalette={confirmColorPalette}
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    {...(useGradient ? {
                                        bgGradient: "to-r",
                                        gradientFrom: `${confirmColorPalette}.400`,
                                        gradientTo: "teal.400",
                                        color: "white",
                                        _hover: { gradientFrom: `${confirmColorPalette}.500`, gradientTo: "teal.500" },
                                    } : {})}
                                    onClick={onConfirm}
                                >
                                    {confirmLabel}
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
