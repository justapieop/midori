import { useState } from "react";
import type { JSX } from "react";
import {
    Button,
    Dialog,
    Field,
    Flex,
    Heading,
    IconButton,
    Image,
    Input,
    Portal,
    Textarea,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { deleteChallenge } from "@/api/challenge";
import type { Challenge } from "@/api/challenge";
import { toaster } from "@/components/ui/toaster";

interface ViewChallengeModalProps {
    challenge: Challenge | null;
    coverUrl?: string;
    onClose: () => void;
    onDeleted: (id: string) => void;
}

export function ViewChallengeModal({ challenge, coverUrl, onClose, onDeleted }: ViewChallengeModalProps): JSX.Element {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!challenge) return;
        setDeleting(true);
        const toastId = toaster.create({ title: "Đang xoá thử thách...", type: "loading" });
        try {
            await deleteChallenge(challenge.id);
            onDeleted(challenge.id);
            onClose();
            toaster.update(toastId, { title: "Xoá thử thách thành công!", type: "success", duration: 3000 });
        } catch {
            toaster.update(toastId, { title: "Xoá thử thách thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Dialog.Root open={!!challenge} onOpenChange={(e) => { if (deleting) return; if (!e.open) onClose(); }}>
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
                            {challenge && (
                                <Flex direction="column" gap={4}>
                                    {coverUrl && (
                                        <Image src={coverUrl} alt={challenge.title} w="full" objectFit="contain" borderRadius="md" />
                                    )}
                                    <Field.Root>
                                        <Field.Label fontSize="sm" color="gray.700">Tiêu đề</Field.Label>
                                        <Input size="sm" value={challenge.title} readOnly color="black" bg="gray.50" />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm" color="gray.700">Mô tả</Field.Label>
                                        <Textarea size="sm" value={challenge.description} readOnly color="black" bg="gray.50" rows={3} />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm" color="gray.700">Hướng dẫn</Field.Label>
                                        <Textarea size="sm" value={challenge.instruction} readOnly color="black" bg="gray.50" rows={3} />
                                    </Field.Root>
                                    <Flex gap={4}>
                                        <Field.Root flex={1}>
                                            <Field.Label fontSize="sm" color="gray.700">Điểm thưởng</Field.Label>
                                            <Input size="sm" value={challenge.points} readOnly color="black" bg="gray.50" />
                                        </Field.Root>
                                        <Field.Root flex={1}>
                                            <Field.Label fontSize="sm" color="gray.700">Thời lượng (ngày)</Field.Label>
                                            <Input size="sm" value={challenge.duration} readOnly color="black" bg="gray.50" />
                                        </Field.Root>
                                    </Flex>
                                    <Flex gap={4}>
                                        <Field.Root flex={1}>
                                            <Field.Label fontSize="sm" color="gray.700">Ngày bắt đầu</Field.Label>
                                            <Input size="sm" value={new Date(challenge.starts_at).toLocaleString("vi-VN")} readOnly color="black" bg="gray.50" />
                                        </Field.Root>
                                        <Field.Root flex={1}>
                                            <Field.Label fontSize="sm" color="gray.700">Ngày kết thúc</Field.Label>
                                            <Input size="sm" value={new Date(challenge.ends_at).toLocaleString("vi-VN")} readOnly color="black" bg="gray.50" />
                                        </Field.Root>
                                    </Flex>
                                </Flex>
                            )}
                        </Dialog.Body>
                        <Flex justify="space-between" align="center" mt={6}>
                            <Button size="sm" colorPalette="red" variant="subtle" loading={deleting} onClick={handleDelete}>Xoá</Button>
                            <Button size="sm" variant="ghost" color="gray.600" disabled={deleting} onClick={onClose}>Đóng</Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
