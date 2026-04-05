import { useState } from "react";
import type { JSX } from "react";
import {
    Box,
    Dialog,
    Flex,
    Heading,
    Portal,
    Separator,
    Text,
} from "@chakra-ui/react";
import { LuTriangleAlert, LuCalendar, LuCircleCheck, LuClock, LuStar } from "react-icons/lu";
import type { Challenge } from "@/api/challenge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModalCoverHeader } from "@/components/ui/ModalCoverHeader";
import { ChallengeModalActions } from "./ChallengeModalActions";
import { StatChip } from "./StatChip";

export function ChallengeDetailModal({
    challenge,
    coverUrl,
    joinable,
    isJoined,
    hasJoinedChallenge,
    onJoin,
    onWithdraw,
    onComplete,
    onClose,
}: {
    challenge: Challenge | null;
    coverUrl?: string;
    joinable: boolean;
    isJoined: boolean;
    hasJoinedChallenge: boolean;
    onJoin: () => void;
    onWithdraw: () => void;
    onComplete: () => void;
    onClose: () => void;
}): JSX.Element {
    const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
    const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (!challenge) return <></>;

    const start = new Date(challenge.starts_at).toLocaleDateString("vi-VN");
    const end = new Date(challenge.ends_at).toLocaleDateString("vi-VN");

    return (
        <>
        <Dialog.Root open={!!challenge} onOpenChange={(d) => { if (!d.open) onClose(); }} size="md">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" overflow="hidden" bg="white" boxShadow="2xl">
                        <ModalCoverHeader title={challenge.title} coverUrl={coverUrl} />

                        <Box p={6}>
                            <Text fontSize="sm" color="gray.600" mb={5} lineHeight="tall">
                                {challenge.description}
                            </Text>

                            <Flex gap={2} flexWrap="wrap" mb={5}>
                                <StatChip icon={<LuStar />} label={`${challenge.points} điểm`} bg="green.50" borderColor="green.200" color="green.700" fontSize="sm" />
                                <StatChip icon={<LuClock />} label={`${challenge.duration} ngày`} bg="blue.50" borderColor="blue.200" color="blue.700" fontSize="sm" />
                                <StatChip icon={<LuCalendar />} label={`${start} – ${end}`} bg="purple.50" borderColor="purple.200" color="purple.700" fontSize="sm" />
                            </Flex>

                            <Separator mb={5} />

                            <Box mb={6} pl={4} borderLeft="3px solid" borderColor="green.400">
                                <Heading size="xs" color="gray.700" mb={2} textTransform="uppercase" letterSpacing="wider">
                                    Hướng dẫn
                                </Heading>
                                <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap" lineHeight="tall">
                                    {challenge.instruction}
                                </Text>
                            </Box>

                            <ChallengeModalActions
                                isJoined={isJoined}
                                hasJoinedChallenge={hasJoinedChallenge}
                                joinable={joinable}
                                onCompleteClick={() => setCompleteConfirmOpen(true)}
                                onWithdrawClick={() => setWithdrawConfirmOpen(true)}
                                onJoinClick={() => setConfirmOpen(true)}
                            />
                        </Box>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>

        <ConfirmDialog
            open={completeConfirmOpen}
            onClose={() => setCompleteConfirmOpen(false)}
            icon={LuCircleCheck}
            iconBg="green.50"
            iconBorderColor="green.200"
            iconColor="green.500"
            title="Hoàn thành thử thách?"
            description="Bạn xác nhận đã hoàn thành thử thách này và muốn nhận điểm thưởng?"
            warning="Sau khi hoàn thành, bạn sẽ không thể chỉnh sửa tiến trình nữa."
            confirmLabel="Xác nhận"
            confirmColorPalette="green"
            useGradient
            onConfirm={() => { setCompleteConfirmOpen(false); onComplete(); onClose(); }}
        />

        <ConfirmDialog
            open={withdrawConfirmOpen}
            onClose={() => setWithdrawConfirmOpen(false)}
            icon={LuTriangleAlert}
            iconBg="red.50"
            iconBorderColor="red.200"
            iconColor="red.500"
            title="Rút khỏi thử thách?"
            description="Toàn bộ tiến trình của bạn sẽ bị xóa. Bạn vẫn có thể tham gia lại thử thách sau."
            confirmLabel="Xác nhận rút"
            confirmColorPalette="red"
            onConfirm={() => { setWithdrawConfirmOpen(false); onWithdraw(); onClose(); }}
        />

        <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            icon={LuTriangleAlert}
            iconBg="orange.50"
            iconBorderColor="orange.200"
            iconColor="orange.500"
            title="Bạn chắc chắn muốn tham gia?"
            description="Nếu bạn thoát khỏi thử thách giữa chừng, toàn bộ tiến trình của bạn sẽ bị xóa. Bạn vẫn có thể tham gia lại thử thách sau."
            cancelColorPalette="red"
            confirmLabel="Xác nhận"
            confirmColorPalette="green"
            useGradient
            onConfirm={() => { setConfirmOpen(false); onJoin(); onClose(); }}
        />
        </>
    );
}
