import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { Box, Button, Dialog, Field, Flex, Grid, Heading, IconButton, Image, Input, NumberInput, Portal, Skeleton, Text, Textarea } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPlus, LuX } from "react-icons/lu";
import { getAllChallenges, createChallenge, deleteChallenge } from "@/api/challenge";
import type { Challenge, DTOCreateChallenge } from "@/api/challenge";
import { fetchImage } from "@/api/file";
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

export default function AdminChallengePage(): JSX.Element {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ChallengeFormData>(emptyForm());
    const [errors, setErrors] = useState<Partial<Record<keyof DTOCreateChallenge, string>>>({});
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);
    const [viewChallenge, setViewChallenge] = useState<Challenge | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [coverImageUrls, setCoverImageUrls] = useState<Record<string, string>>({});

    function loadCoverImages(challenges: Challenge[]) {
        challenges.forEach((c) => {
            if (!c.cover_image) return;
            fetchImage(c.cover_image)
                .then((buf) => {
                    const blob = new Blob([buf]);
                    const url = URL.createObjectURL(blob);
                    setCoverImageUrls((prev) => ({ ...prev, [c.id]: url }));
                })
                .catch(() => { /* ignore failed image loads */ });
        });
    }

    async function handleDelete() {
        if (!viewChallenge) return;
        setDeleting(true);
        const toastId = toaster.create({ title: "Đang xoá thử thách...", type: "loading" });
        try {
            await deleteChallenge(viewChallenge.id);
            setChallenges((prev) => prev.filter((c) => c.id !== viewChallenge.id));
            setViewChallenge(null);
            toaster.update(toastId, { title: "Xoá thử thách thành công!", type: "success", duration: 3000 });
        } catch {
            toaster.update(toastId, { title: "Xoá thử thách thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
        } finally {
            setDeleting(false);
        }
    }

    function validate(): boolean {
        const e: Partial<Record<keyof DTOCreateChallenge, string>> = {};
        if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề.";
        else if (form.title.length > 256) e.title = "Tiêu đề không được vượt quá 256 ký tự.";
        if (!form.description.trim()) e.description = "Vui lòng nhập mô tả.";
        if (!form.instruction.trim()) e.instruction = "Vui lòng nhập hướng dẫn.";
        const now = new Date();
        const startsAt = new Date(form.starts_at);
        const endsAt = new Date(form.ends_at);
        if (!form.starts_at || isNaN(startsAt.getTime())) e.starts_at = "Vui lòng chọn ngày bắt đầu.";
        else if (startsAt < now) e.starts_at = "Ngày bắt đầu không được sớm hơn hiện tại.";
        if (!form.ends_at || isNaN(endsAt.getTime())) e.ends_at = "Vui lòng chọn ngày kết thúc.";
        else if (!e.starts_at && endsAt <= startsAt) e.ends_at = "Ngày kết thúc phải sau ngày bắt đầu.";
        if (form.points <= 0) e.points = "Điểm thưởng phải lớn hơn 0.";
        if (form.duration <= 0) e.duration = "Thời lượng phải lớn hơn 0.";
        if (!coverImage) e.cover_image = "Vui lòng chọn ảnh bìa.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    useEffect(() => {
        getAllChallenges()
            .then((data) => {
                setChallenges(data);
                loadCoverImages(data);
            })
            .finally(() => setLoading(false));
    }, []);

    function handleField<K extends keyof ChallengeFormData>(key: K, value: ChallengeFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function handleDateField(key: "starts_at" | "ends_at", raw: string) {
        if (!raw) return;
        const date = new Date(raw);
        if (isNaN(date.getTime())) {
            toaster.create({ title: "Ngày không hợp lệ.", type: "error", duration: 3000 });
            return;
        }
        handleField(key, date.toISOString());
    }

    async function handleSave() {
        if (!validate()) return;
        console.log("Creating challenge:", form);
        setSaving(true);
        const toastId = toaster.create({
            title: "Đang lưu thử thách...",
            type: "loading",
        });
        try {
            const created = await createChallenge({ ...form, cover_image: coverImage! });
            setChallenges((prev) => [...prev, created]);
            // fetch cover for newly created challenge
            if (created.cover_image) {
                fetchImage(created.cover_image)
                    .then((buf) => {
                        const blob = new Blob([buf]);
                        const url = URL.createObjectURL(blob);
                        setCoverImageUrls((prev) => ({ ...prev, [created.id]: url }));
                    })
                    .catch(() => { /* ignore */ });
            }
            setModalOpen(false);
            setForm(emptyForm());
            setErrors({});
            setCoverImage(null);
            setCoverImagePreview(null);
            toaster.update(toastId, {
                title: "Tạo thử thách thành công!",
                type: "success",
                duration: 3000,
            });
        } catch {
            toaster.update(toastId, {
                title: "Tạo thử thách thất bại.",
                description: "Vui lòng thử lại.",
                type: "error",
                duration: 4000,
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Box
                pt="2rem"
                px={{ base: 4, md: 8 }}
                maxW="1200px"
                mx="auto"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    color="gray.600"
                    _hover={{ bg: "gray.100" }}
                    mb={6}
                    gap={2}
                    onClick={() => navigate("/admin")}
                >
                    <LuArrowLeft />
                    Quản trị
                </Button>

                <Flex align="center" justify="space-between" mb={6}>
                    <Heading size="lg" color="gray.800">
                        Quản lý thử thách
                    </Heading>
                    <Button
                        size="sm"
                        bg="green.600"
                        color="white"
                        _hover={{ bg: "green.700" }}
                        gap={2}
                        onClick={() => setModalOpen(true)}
                    >
                        <LuPlus />
                        Thêm thử thách
                    </Button>
                </Flex>

                <Dialog.Root open={modalOpen} onOpenChange={(e) => { if (saving) return; setModalOpen(e.open); if (!e.open) { setForm(emptyForm()); setErrors({}); setCoverImage(null); setCoverImagePreview(null); } }}>
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
                                                    <Image
                                                        src={coverImagePreview}
                                                        alt="Cover preview"
                                                        w="full"
                                                        borderRadius="md"
                                                        objectFit="contain"
                                                    />
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
                                                type="datetime-local"
                                                color="black"
                                                _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                                value={form.starts_at
                                                    ? new Date(form.starts_at).toISOString().slice(0, 16)
                                                    : ""}
                                                onChange={(e) => handleDateField("starts_at", e.target.value)}
                                            />
                                            {errors.starts_at && <Field.ErrorText>{errors.starts_at}</Field.ErrorText>}
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.ends_at}>
                                            <Field.Label fontSize="sm" color="gray.700">Ngày kết thúc</Field.Label>
                                            <Input
                                                size="sm"
                                                type="datetime-local"
                                                color="black"
                                                _focusVisible={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                                value={form.ends_at
                                                    ? new Date(form.ends_at).toISOString().slice(0, 16)
                                                    : ""}
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

                {loading ? (
                    <Grid
                        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                        gap={4}
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} borderRadius="xl" height="72px" />
                        ))}
                    </Grid>
                ) : challenges.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">Chưa có thử thách nào.</Text>
                ) : (
                    <Grid
                        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                        gap={4}
                        alignItems="start"
                    >
                        {challenges.map((challenge) => (
                            <Box
                                key={challenge.id}
                                bg="white"
                                borderRadius="xl"
                                boxShadow="sm"
                                border="1px solid"
                                borderColor="gray.200"
                                overflow="hidden"
                                cursor="pointer"
                                _hover={{ boxShadow: "md", borderColor: "green.300" }}
                                transition="all 0.15s"
                                onClick={() => setViewChallenge(challenge)}
                            >
                                {coverImageUrls[challenge.id] && (
                                    <Image
                                        src={coverImageUrls[challenge.id]}
                                        alt={challenge.title}
                                        w="full"
                                        objectFit="contain"
                                    />
                                )}
                                <Box p={5}>
                                    <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                                        {challenge.title}
                                    </Text>
                                    <Text color="gray.500" fontSize="xs" mt={1} lineClamp={2}>
                                        {challenge.description}
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* View challenge modal */}
            <Dialog.Root open={!!viewChallenge} onOpenChange={(e) => { if (deleting) return; if (!e.open) setViewChallenge(null); }}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content borderRadius="xl" p={6} maxW="480px" w="full" bg="white">
                            <Flex justify="space-between" align="center" mb={4}>
                                <Dialog.Title>
                                    <Heading size="md" color="gray.800">Chi tiết thử thách</Heading>
                                </Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <IconButton aria-label="Đóng" variant="ghost" size="sm">
                                        <LuX />
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </Flex>
                            <Dialog.Body px={0}>
                                {viewChallenge && (
                                    <Flex direction="column" gap={4}>
                                        {coverImageUrls[viewChallenge.id] && (
                                            <Image
                                                src={coverImageUrls[viewChallenge.id]}
                                                alt={viewChallenge.title}
                                                w="full"
                                                objectFit="contain"
                                                borderRadius="md"
                                            />
                                        )}
                                        <Field.Root>
                                            <Field.Label fontSize="sm" color="gray.700">Tiêu đề</Field.Label>
                                            <Input size="sm" value={viewChallenge.title} readOnly color="black" bg="gray.50" />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm" color="gray.700">Mô tả</Field.Label>
                                            <Textarea size="sm" value={viewChallenge.description} readOnly color="black" bg="gray.50" rows={3} />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm" color="gray.700">Hướng dẫn</Field.Label>
                                            <Textarea size="sm" value={viewChallenge.instruction} readOnly color="black" bg="gray.50" rows={3} />
                                        </Field.Root>
                                        <Flex gap={4}>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Điểm thưởng</Field.Label>
                                                <Input size="sm" value={viewChallenge.points} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Thời lượng (ngày)</Field.Label>
                                                <Input size="sm" value={viewChallenge.duration} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                        </Flex>
                                        <Flex gap={4}>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Ngày bắt đầu</Field.Label>
                                                <Input size="sm" value={new Date(viewChallenge.starts_at).toLocaleString("vi-VN")} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                            <Field.Root flex={1}>
                                                <Field.Label fontSize="sm" color="gray.700">Ngày kết thúc</Field.Label>
                                                <Input size="sm" value={new Date(viewChallenge.ends_at).toLocaleString("vi-VN")} readOnly color="black" bg="gray.50" />
                                            </Field.Root>
                                        </Flex>
                                    </Flex>
                                )}
                            </Dialog.Body>
                            <Flex justify="space-between" align="center" mt={6}>
                                <Button size="sm" colorPalette="red" variant="subtle" loading={deleting} onClick={handleDelete}>Xoá</Button>
                                <Button size="sm" variant="ghost" color="gray.600" disabled={deleting} onClick={() => setViewChallenge(null)}>Đóng</Button>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
}
