import { useRef, useState } from "react";
import type { JSX } from "react";
import {
    Box,
    Button,
    Dialog,
    Field,
    Flex,
    Heading,
    IconButton,
    Image,
    Input,
    NumberInput,
    Portal,
    Text,
    Textarea,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { createChallenge } from "@/api/challenge";
import type { Challenge, DTOCreateChallenge } from "@/api/challenge";
import { fetchPublicAssets } from "@/api/file";
import { toaster } from "@/components/ui/toaster";

type ChallengeFormData = Omit<DTOCreateChallenge, "cover_image">;

const emptyForm = (): ChallengeFormData => ({
    title: "",
    description: "",
    instruction: "",
    starts_at: "",
    ends_at: "",
    points: 0,
    duration: 0,
});

interface CreateChallengeModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (challenge: Challenge, coverUrl?: string) => void;
}

export function CreateChallengeModal({ open, onClose, onCreated }: CreateChallengeModalProps): JSX.Element {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ChallengeFormData>(emptyForm());
    const [errors, setErrors] = useState<Partial<Record<keyof DTOCreateChallenge, string>>>({});
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);

    function handleField<K extends keyof ChallengeFormData>(key: K, value: ChallengeFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function handleDateField(key: "starts_at" | "ends_at", raw: string) {
        handleField(key, raw);
    }

    function reset() {
        setForm(emptyForm());
        setErrors({});
        setCoverImage(null);
        setCoverImagePreview(null);
    }

    function validate(): boolean {
        const e: Partial<Record<keyof DTOCreateChallenge, string>> = {};
        if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề.";
        else if (form.title.length > 256) e.title = "Tiêu đề không được vượt quá 256 ký tự.";
        if (!form.description.trim()) e.description = "Vui lòng nhập mô tả.";
        if (!form.instruction.trim()) e.instruction = "Vui lòng nhập hướng dẫn.";
        const startsAt = new Date(form.starts_at);
        const endsAt = new Date(form.ends_at);
        if (!form.ends_at || isNaN(endsAt.getTime())) e.ends_at = "Vui lòng chọn ngày kết thúc.";
        else if (endsAt <= startsAt) e.ends_at = "Ngày kết thúc phải sau ngày bắt đầu.";
        if (form.points <= 0) e.points = "Điểm thưởng phải lớn hơn 0.";
        if (form.duration <= 0) e.duration = "Thời lượng phải lớn hơn 0.";
        if (!coverImage) e.cover_image = "Vui lòng chọn ảnh bìa.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;
        setSaving(true);
        const payload = {
            ...form,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : "",
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : "",
            cover_image: coverImage!,
        };
        const toastId = toaster.create({ title: "Đang lưu thử thách...", type: "loading" });
        try {
            const created = await createChallenge(payload);
            let coverUrl: string | undefined;
            if (created.cover_image) {
                coverUrl = fetchPublicAssets(created.cover_image);
            }
            onCreated(created, coverUrl);
            reset();
            onClose();
            toaster.update(toastId, { title: "Tạo thử thách thành công!", type: "success", duration: 3000 });
        } catch {
            toaster.update(toastId, { title: "Tạo thử thách thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
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
                    <Dialog.Content borderRadius="xl" p={6} maxW="480px" w="full" bg="white" position="relative">
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
                                <Heading size="md" color="gray.800">Thêm thử thách</Heading>
                            </Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <IconButton aria-label="Đóng" variant="ghost" size="sm" disabled={saving}>
                                    <LuX />
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>
                        <Dialog.Body px={0}>
                            <Flex direction="column" gap={4}>
                                <Field.Root required invalid={!!errors.title}>
                                    <Field.Label fontSize="sm" color="gray.700">Tiêu đề</Field.Label>
                                    <Input
                                        size="sm"
                                        placeholder="Tên thử thách"
                                        value={form.title}
                                        color="black"
                                        _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                        onChange={(e) => handleField("title", e.target.value)}
                                    />
                                    {errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
                                </Field.Root>

                                <Field.Root required invalid={!!errors.description}>
                                    <Field.Label fontSize="sm" color="gray.700">Mô tả</Field.Label>
                                    <Textarea
                                        size="sm"
                                        placeholder="Mô tả ngắn về thử thách"
                                        rows={3}
                                        value={form.description}
                                        color="black"
                                        _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                        onChange={(e) => handleField("description", e.target.value)}
                                    />
                                    {errors.description && <Field.ErrorText>{errors.description}</Field.ErrorText>}
                                </Field.Root>

                                <Field.Root required invalid={!!errors.instruction}>
                                    <Field.Label fontSize="sm" color="gray.700">Hướng dẫn</Field.Label>
                                    <Textarea
                                        size="sm"
                                        placeholder="Hướng dẫn thực hiện thử thách"
                                        rows={3}
                                        value={form.instruction}
                                        color="black"
                                        _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                        onChange={(e) => handleField("instruction", e.target.value)}
                                    />
                                    {errors.instruction && <Field.ErrorText>{errors.instruction}</Field.ErrorText>}
                                </Field.Root>

                                <Flex gap={4}>
                                    <Field.Root required flex={1} invalid={!!errors.points}>
                                        <Field.Label fontSize="sm" color="gray.700">Điểm thưởng</Field.Label>
                                        <NumberInput.Root
                                            size="sm"
                                            min={0}
                                            value={String(form.points)}
                                            onValueChange={(e) => handleField("points", Number(e.value))}
                                        >
                                            <NumberInput.Input placeholder="0" color="black" _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }} />
                                        </NumberInput.Root>
                                        {errors.points && <Field.ErrorText>{errors.points}</Field.ErrorText>}
                                    </Field.Root>

                                    <Field.Root required flex={1} invalid={!!errors.duration}>
                                        <Field.Label fontSize="sm" color="gray.700">Thời lượng (ngày)</Field.Label>
                                        <NumberInput.Root
                                            size="sm"
                                            min={0}
                                            value={String(form.duration)}
                                            onValueChange={(e) => handleField("duration", Number(e.value))}
                                        >
                                            <NumberInput.Input placeholder="0" color="black" _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }} />
                                        </NumberInput.Root>
                                        {errors.duration && <Field.ErrorText>{errors.duration}</Field.ErrorText>}
                                    </Field.Root>
                                </Flex>

                                <Field.Root required invalid={!!errors.cover_image}>
                                    <Field.Label fontSize="sm" color="gray.700">Ảnh bìa</Field.Label>
                                    <input
                                        ref={coverImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            setCoverImage(file);
                                            setCoverImagePreview(file ? URL.createObjectURL(file) : null);
                                            setErrors((prev) => ({ ...prev, cover_image: undefined }));
                                        }}
                                    />
                                    <Box
                                        border="1px dashed"
                                        borderColor={errors.cover_image ? "red.400" : "gray.300"}
                                        borderRadius="md"
                                        p={3}
                                        cursor="pointer"
                                        _hover={{ borderColor: "green.400", bg: "green.50" }}
                                        transition="all 0.15s"
                                        onClick={() => coverImageInputRef.current?.click()}
                                        textAlign="center"
                                    >
                                        {coverImagePreview ? (
                                            <Image src={coverImagePreview} alt="Cover preview" w="full" borderRadius="md" objectFit="contain" />
                                        ) : (
                                            <Text fontSize="sm" color="gray.400">Nhấn để chọn ảnh bìa</Text>
                                        )}
                                    </Box>
                                    {coverImage && (
                                        <Text fontSize="xs" color="gray.500" mt={1}>{coverImage.name}</Text>
                                    )}
                                    {errors.cover_image && <Field.ErrorText>{errors.cover_image}</Field.ErrorText>}
                                </Field.Root>

                                <Field.Root required invalid={!!errors.starts_at}>
                                    <Field.Label fontSize="sm" color="gray.700">Ngày bắt đầu</Field.Label>
                                    <Input
                                        size="sm"
                                        type="date"
                                        color="black"
                                        _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                        value={form.starts_at}
                                        onChange={(e) => handleDateField("starts_at", e.target.value)}
                                    />
                                    {errors.starts_at && <Field.ErrorText>{errors.starts_at}</Field.ErrorText>}
                                </Field.Root>

                                <Field.Root required invalid={!!errors.ends_at}>
                                    <Field.Label fontSize="sm" color="gray.700">Ngày kết thúc</Field.Label>
                                    <Input
                                        size="sm"
                                        type="date"
                                        color="black"
                                        _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                        value={form.ends_at}
                                        onChange={(e) => handleDateField("ends_at", e.target.value)}
                                    />
                                    {errors.ends_at && <Field.ErrorText>{errors.ends_at}</Field.ErrorText>}
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>
                        <Flex justify="flex-end" gap={2} mt={6}>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="ghost" size="sm" color="gray.600" disabled={saving}>Huỷ</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                size="sm"
                                bg="green.600"
                                color="white"
                                _hover={{ bg: "green.700" }}
                                loading={saving}
                                onClick={handleSave}
                            >
                                Lưu
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
