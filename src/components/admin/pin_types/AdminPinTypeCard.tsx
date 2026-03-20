import { Box, Button, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import type { PinType, Pin as PinData } from "@/api/pin";
import { LuTrash2, LuPencil, LuChevronDown, LuChevronUp, LuMapPin, LuPlus } from "react-icons/lu";

interface AdminPinTypeCardProps {
    type: PinType;
    pins: PinData[];
    expanded: boolean;
    onToggleExpand: (id: string) => void;
    onCreatePin: (type: PinType) => void;
}

export function AdminPinTypeCard({ type, pins, expanded, onToggleExpand, onCreatePin }: AdminPinTypeCardProps) {
    const typePins = pins.filter(p => p.type_id === type.id);

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
                    onClick={() => {
                        // TODO: Delete pin type
                        alert(`Delete pin type: ${type.name} - to be implemented`);
                    }}
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
        </Box>
    );
}