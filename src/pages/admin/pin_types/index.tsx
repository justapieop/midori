import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Box, Button, Flex, Grid, GridItem, Heading, Spinner, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import authgear, { SessionState } from "@authgear/web";
import { fetchUserProfile } from "@/api/user";
import { fetchAllPinTypes, fetchAllPins, deletePinType } from "@/api/pin";
import type { PinType, Pin as PinData } from "@/api/pin";
import { CreatePinTypeModal } from "@/components/admin/pin_types/CreatePinTypeModal";
import { CreatePinModal } from "@/components/admin/pin_types/CreatePinModal";
import { AdminPinTypeCard } from "@/components/admin/pin_types/AdminPinTypeCard";
import { toaster } from "@/components/ui/toaster";

export default function AdminPinTypesPage(): JSX.Element {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [pinTypes, setPinTypes] = useState<PinType[]>([]);
    const [pins, setPins] = useState<PinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createPinModalType, setCreatePinModalType] = useState<PinType | null>(null);
    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpandedTypes((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    async function handleDeletePinType(type: PinType): Promise<void> {
        const toastId = toaster.create({ title: "Đang xoá loại điểm...", type: "loading" });
        try {
            await deletePinType(type.id);
            setPinTypes((prev) => prev.filter((t) => t.id !== type.id));
            setPins((prev) => prev.filter((p) => p.type_id !== type.id));
            toaster.update(toastId, { title: `Đã xoá loại điểm "${type.name}"!`, type: "success", duration: 3000 });
        } catch {
            toaster.update(toastId, { title: "Xoá loại điểm thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
            throw new Error("failed to delete");
        }
    }

    useEffect(() => {
        if (authgear.sessionState !== SessionState.Authenticated) {
            navigate("/");
            return;
        }

        fetchUserProfile()
            .then((profile) => {
                if (!profile.admin) {
                    navigate("/");
                } else {
                    setChecking(false);
                }
            })
            .catch(() => navigate("/"));
    }, []);

    useEffect(() => {
        if (!checking) {
            Promise.all([fetchAllPinTypes(), fetchAllPins()])
                .then(([typesData, pinsData]) => {
                    setPinTypes(typesData);
                    setPins(pinsData);
                })
                .finally(() => setLoading(false));
        }
    }, [checking]);

    if (checking) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="gray.50">
                <Spinner size="lg" />
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Box pt="2rem" px={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
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
                    <Heading size="lg" color="gray.800">Quản lý loại điểm</Heading>
                    <Button
                        size="sm"
                        bg="purple.600"
                        color="white"
                        _hover={{ bg: "purple.700" }}
                        gap={2}
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <LuPlus />
                        Thêm loại điểm
                    </Button>
                </Flex>

                {loading ? (
                    <Flex justify="center" align="center" minH="200px">
                        <Spinner size="lg" />
                    </Flex>
                ) : pinTypes.length === 0 ? (
                    <Box bg="white" borderRadius="xl" p={8} textAlign="center">
                        <Text color="gray.400" fontSize="sm">Chưa có loại điểm nào.</Text>
                    </Box>
                ) : (
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
                        {pinTypes.map((type) => (
                            <GridItem key={type.id}>
                                <AdminPinTypeCard
                                    type={type}
                                    pins={pins}
                                    expanded={expandedTypes[type.id] ?? false}
                                    onToggleExpand={toggleExpand}
                                    onCreatePin={setCreatePinModalType}
                                    onDelete={handleDeletePinType}
                                />
                            </GridItem>
                        ))}
                    </Grid>
                )}

                <CreatePinTypeModal
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onCreated={(newType) => {
                        setPinTypes((prev) => [...prev, newType]);
                    }}
                />

                <CreatePinModal
                    open={!!createPinModalType}
                    onClose={() => setCreatePinModalType(null)}
                    pinType={createPinModalType}
                    onCreated={(newPin) => {
                        setPins((prev) => [...prev, newPin]);
                        if (createPinModalType) {
                            setExpandedTypes((prev) => ({ ...prev, [createPinModalType.id]: true }));
                        }
                    }}
                />
            </Box>
        </Box>
    );
}
