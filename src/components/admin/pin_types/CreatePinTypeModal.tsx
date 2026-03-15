import { useState } from "react";
import type { JSX } from "react";
import {
    Box,
    Button,
    Dialog,
    Field,
    Flex,
    Heading,
    IconButton,
    Input,
    Portal,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { createPinType } from "@/api/pin";
import type { PinType, DTOCreatePinType } from "@/api/pin";
import { toaster } from "@/components/ui/toaster";

interface CreatePinTypeModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (pinType: PinType) => void;
}

export function CreatePinTypeModal({ open, onClose, onCreated }: CreatePinTypeModalProps): JSX.Element {
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [errors, setErrors] = useState<Partial<Record<keyof DTOCreatePinType, string>>>({});

    function reset() {
        setName("");
        setIcon("");
        setErrors({});
    }

    function validate(): boolean {
        const e: Partial<Record<keyof DTOCreatePinType, string>> = {};
        if (!name.trim()) e.name = "Vui lòng nhập tên loại điểm.";
        if (!icon.trim()) e.icon = "Vui lòng nhập icon (emoji).";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;
        setSaving(true);
        const payload: DTOCreatePinType = {
            name: name.trim(),
            icon: icon.trim(),
        };
        const toastId = toaster.create({ title: "Đang lưu loại điểm...", type: "loading" });
        try {
            const created = await createPinType(payload);
            onCreated(created);
            reset();
            onClose();
            toaster.update(toastId, { title: "Thêm loại điểm thành công!", type: "success", duration: 3000 });
        } catch {
            toaster.update(toastId, { title: "Thêm loại điểm thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
        } finally {
            setSaving(false);
        }
    }

    function handleOpenChange(e: { open: boolean }) {
        if (saving) return;
        if (!e.open) { reset(); onClose(); }
    }

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="xl" p={6} maxW="400px" w="full" bg="white" position="relative">
                        {saving && (
                            <Box
                                position="absolute"
                                inset={0}
                                bg="whiteAlpha.700"
                                borderRadius="xl"
                                zIndex={10}
                                cursor="not-allowed"
                            />
                        )}
                        <Flex justify="space-between" align="center" mb={4}>
                            <Dialog.Title>
                                <Heading size="md" color="gray.800">Thêm loại điểm</Heading>
                            </Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <IconButton aria-label="Đóng" variant="ghost" size="sm" disabled={saving}>
                                    <LuX />
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>

                        <Dialog.Body px={0}>
                            <Flex direction="column" gap={4}>
                                <Field.Root required invalid={!!errors.name}>
                                    <Field.Label fontSize="sm" color="gray.700">Tên loại điểm</Field.Label>
                                    <Input
                                        size="sm"
                                        placeholder="Ví dụ: Cây ATM, Thùng rác..."
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setErrors((prev) => ({ ...prev, name: undefined }));
                                        }}
                                        color="black"
                                        _focusVisible={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                                    />
                                    {errors.name && <Field.ErrorText color="red.500">{errors.name}</Field.ErrorText>}
                                </Field.Root>

                                <Field.Root required invalid={!!errors.icon}>
                                    <Field.Label fontSize="sm" color="gray.700">Icon (Emoji)</Field.Label>
                                    <Input
                                        size="sm"
                                        placeholder="Ví dụ: 🏧, 🗑️..."
                                        value={icon}
                                        onChange={(e) => {
                                            setIcon(e.target.value);
                                            setErrors((prev) => ({ ...prev, icon: undefined }));
                                        }}
                                        color="black"
                                        _focusVisible={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                                    />
                                    {errors.icon && <Field.ErrorText color="red.500">{errors.icon}</Field.ErrorText>}
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer px={0} pb={0} pt={6}>
                            <Button variant="outline" size="sm" onClick={() => { reset(); onClose(); }} disabled={saving} color="black">
                                Huỷ
                            </Button>
                            <Button bg="purple.600" color="white" _hover={{ bg: "purple.700" }} size="sm" onClick={handleSave} disabled={saving} loading={saving}>
                                Lưu loại điểm
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
