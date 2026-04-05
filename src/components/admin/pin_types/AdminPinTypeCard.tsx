import { useState } from "react";
import { Box, Button, Dialog, Flex, Heading, Icon, IconButton, Portal, Text, VStack } from "@chakra-ui/react";
import type { PinType, Pin as PinData } from "@/api/pin";
import { LuTrash2, LuPencil, LuChevronDown, LuChevronUp, LuMapPin, LuPlus, LuX, LuTriangleAlert } from "react-icons/lu";

interface AdminPinTypeCardProps {
    type: PinType;
    pins: PinData[];
    expanded: boolean;
    onToggleExpand: (id: string) => void;
    onCreatePin: (type: PinType) => void;
    onDelete: (type: PinType) => Promise<void>;
}

export function AdminPinTypeCard({ type, pins, expanded, onToggleExpand, onCreatePin, onDelete }: AdminPinTypeCardProps) {
    const typePins = pins.filter(p => p.type_id === type.id);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleConfirmDelete() {
        setDeleting(true);
        try {
            await onDelete(type);
            setConfirmOpen(false);
        } catch {
            // error is handled by the parent via toaster
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            p={4}
            _hover={{ boxShadow: "md", borderColor: "purple.300" }}
            transition="all 0.15s"
        >
            <Flex align="center" justify="center" bg="gray.50" borderRadius="lg" mb={3} p={3} minH="80px">
                {type.icon ? (
                    <Text fontSize="4xl" lineHeight={1}>
                        {type.icon}
                    </Text>
                ) : (
                    <Text fontSize="sm" color="gray.400">Không có icon</Text>
                )}
            </Flex>
            <Text fontWeight="semibold" color="gray.800" mb={3} fontSize="sm" lineClamp={2}>
                {type.name}
            </Text>
            <Flex gap={2} mb={3}>
                <Button
                    size="xs"
                    bg="blue.50"
                    color="blue.600"
                    _hover={{ bg: "blue.100" }}
                    flex={1}
                    gap={1}
                    onClick={() => {
                        // TODO: Open modal to edit pin type
                        alert(`Edit pin type: ${type.name} - to be implemented`);
                    }}
                >
                    <Icon as={LuPencil} boxSize={3} />
                    Sửa
                </Button>
                <Button
                    size="xs"
                    bg="red.50"
                    color="red.600"
                    _hover={{ bg: "red.100" }}
                    flex={1}
                    gap={1}
                    onClick={() => setConfirmOpen(true)}
                >
                    <Icon as={LuTrash2} boxSize={3} />
                    Xoá
                </Button>
            </Flex>
            
            <Button
                size="xs"
                w="full"
                bg="green.50"
                color="green.600"
                _hover={{ bg: "green.100" }}
                mb={3}
                gap={1}
                onClick={() => onCreatePin(type)}
            >
                <Icon as={LuPlus} boxSize={3} />
                Thêm điểm
            </Button>

            <Box borderTop="1px solid" borderColor="gray.100" pt={2} mt={2}>
                <Button
                    size="xs"
                    variant="ghost"
                    w="full"
                    justifyContent="space-between"
                    color="gray.600"
                    onClick={() => onToggleExpand(type.id)}
                >
                    <Text>Các điểm thuộc loại này ({typePins.length})</Text>
                    {expanded ? <LuChevronUp /> : <LuChevronDown />}
                </Button>
                
                {expanded && (
                    <VStack align="stretch" mt={2} maxH="200px" overflowY="auto" gap={1} pr={1}>
                        {typePins.length > 0 ? (
                            typePins.map(pin => (
                                <Flex 
                                    key={pin.id} 
                                    bg="gray.50" 
                                    p={2} 
                                    borderRadius="md" 
                                    align="center" 
                                    gap={2}
                                    _hover={{ bg: "gray.100" }}
                                    cursor="pointer"
                                >
                                    <Icon as={LuMapPin} color="purple.500" boxSize={3} />
                                    <Box flex={1} overflow="hidden">
                                        <Text fontSize="xs" fontWeight="medium" color="gray.800" truncate>{pin.name}</Text>
                                        <Text fontSize="2xs" color="gray.500" truncate>{pin.address}</Text>
                                    </Box>
                                </Flex>
                            ))
                        ) : (
                            <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>
                                Chưa có điểm nào.
                            </Text>
                        )}
                    </VStack>
                )}
            </Box>

            {/* Delete confirmation dialog */}
            <Dialog.Root open={confirmOpen} onOpenChange={(e) => { if (!deleting) setConfirmOpen(e.open); }}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content borderRadius="xl" p={6} maxW="400px" w="full" bg="white" position="relative">
                            {deleting && (
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
                                    <Heading size="md" color="gray.800">Xác nhận xoá</Heading>
                                </Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <IconButton aria-label="Đóng" variant="ghost" size="sm" disabled={deleting}>
                                        <LuX />
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </Flex>

                            <Dialog.Body px={0}>
                                <Flex align="center" gap={3} bg="red.50" p={3} borderRadius="lg" mb={3}>
                                    <Icon as={LuTriangleAlert} color="red.500" boxSize={5} />
                                    <Text fontSize="sm" color="red.700" fontWeight="medium">
                                        Hành động này không thể hoàn tác!
                                    </Text>
                                </Flex>
                                <Text fontSize="sm" color="gray.700">
                                    Bạn có chắc chắn muốn xoá loại điểm <strong>"{type.name}"</strong> không?
                                </Text>
                                <Text fontSize="sm" color="gray.700" mt={2}>
                                    Tất cả <strong>{typePins.length} điểm</strong> thuộc loại này cũng sẽ bị xoá vĩnh viễn.
                                </Text>
                            </Dialog.Body>

                            <Dialog.Footer px={0} pb={0} pt={6}>
                                <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={deleting} color="black">
                                    Huỷ
                                </Button>
                                <Button bg="red.600" color="white" _hover={{ bg: "red.700" }} size="sm" onClick={handleConfirmDelete} disabled={deleting} loading={deleting}>
                                    Xoá loại điểm
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
}