import type { JSX } from "react";
import { Box, Flex, IconButton, Text, Textarea } from "@chakra-ui/react";
import { LuCheck, LuPencil, LuX } from "react-icons/lu";

interface BioEditorProps {
    bioValue: string;
    editing: boolean;
    onBioChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
}

export function BioEditor({ bioValue, editing, onBioChange, onSave, onCancel, onEdit }: BioEditorProps): JSX.Element {
    if (editing) {
        return (
            <Box w="100%" maxW="480px">
                <Textarea
                    value={bioValue}
                    onChange={(e) => onBioChange(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu về bạn..."
                    size="sm"
                    borderRadius="xl"
                    resize="none"
                    rows={3}
                    textAlign="center"
                    color="black"
                    autoFocus
                />
                <Flex justify="center" gap={2} mt={2}>
                    <IconButton
                        aria-label="Lưu"
                        size="xs"
                        colorPalette="green"
                        borderRadius="full"
                        onClick={onSave}
                    >
                        <LuCheck />
                    </IconButton>
                    <IconButton
                        aria-label="Hủy"
                        size="xs"
                        variant="outline"
                        colorPalette="red"
                        borderRadius="full"
                        onClick={onCancel}
                    >
                        <LuX />
                    </IconButton>
                </Flex>
            </Box>
        );
    }

    return (
        <Flex align="flex-start" gap={1} maxW="480px">
            {bioValue ? (
                <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="tall" flex={1}>
                    {bioValue}
                </Text>
            ) : (
                <Text fontSize="sm" color="gray.300" textAlign="center" fontStyle="italic" flex={1}>
                    Chưa có giới thiệu.
                </Text>
            )}
            <IconButton
                aria-label="Chỉnh sửa giới thiệu"
                size="2xs"
                variant="ghost"
                color="gray.400"
                borderRadius="full"
                onClick={onEdit}
                _hover={{ color: "gray.600" }}
                flexShrink={0}
                mt={0.5}
            >
                <LuPencil />
            </IconButton>
        </Flex>
    );
}
