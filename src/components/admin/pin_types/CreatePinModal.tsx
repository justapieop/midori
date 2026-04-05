import { useState } from "react";
import type { JSX } from "react";
import {
    Box,
    Button,
    Dialog,
    Field,
    Flex,
    Grid,
    GridItem,
    Heading,
    IconButton,
    Input,
    Portal,
    Textarea,
    Text,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { createPin } from "@/api/pin";
import type { Pin, DTOCreatePin, PinType } from "@/api/pin";
import { toaster } from "@/components/ui/toaster";

interface CreatePinModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (pin: Pin) => void;
    pinType: PinType | null;
}

export function CreatePinModal({ open, onClose, onCreated, pinType }: CreatePinModalProps): JSX.Element {
    const [saving, setSaving] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [lat, setLat] = useState("");
    const [long, setLong] = useState("");
    const [address, setAddress] = useState("");
    const [isSponsored, setIsSponsored] = useState(false);
    const [terms, setTerms] = useState("");
    const [opening, setOpening] = useState("08:00");
    const [closing, setClosing] = useState("22:00");
    const [instruction, setInstruction] = useState("");
    const [note, setNote] = useState("");
    const [accepts, setAccepts] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [openingDays, setOpeningDays] = useState(0b1111111);

    const [errors, setErrors] = useState<Partial<Record<keyof DTOCreatePin, string>>>({});

    function reset() {
        setName("");
        setLat("");
        setLong("");
        setAddress("");
        setIsSponsored(false);
        setTerms("");
        setOpening("08:00");
        setClosing("22:00");
        setInstruction("");
        setNote("");
        setAccepts("");
        setImage(null);
        setOpeningDays(0b1111111);
        setErrors({});
    }

    function parseTime(timeStr: string): [number, number] {
        const [h, m] = timeStr.split(":").map(Number);
        return [h || 0, m || 0];
    }

    function validate(): boolean {
        const e: Partial<Record<keyof DTOCreatePin, string>> = {};
        if (!name.trim()) e.name = "Vui lòng nhập tên điểm.";
        if (isNaN(parseFloat(lat)) || !lat.trim()) e.lat = "Vĩ độ không hợp lệ.";
        if (isNaN(parseFloat(long)) || !long.trim()) e.long = "Kinh độ không hợp lệ.";
        if (!address.trim()) e.address = "Vui lòng nhập địa chỉ.";
        if (!opening) e.opening = "Vui lòng nhập giờ mở cửa.";
        if (!closing) e.closing = "Vui lòng nhập giờ đóng cửa.";
        
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave() {
        if (!validate() || !pinType) return;
        
        setSaving(true);
        const payload: DTOCreatePin = {
            name: name.trim(),
            lat: parseFloat(lat),
            long: parseFloat(long),
            address: address.trim(),
            is_sponsored: isSponsored,
            terms: terms.trim(),
            opening: parseTime(opening),
            closing: parseTime(closing),
            instruction: instruction.trim(),
            note: note.trim(),
            accepts: accepts.trim(),
            image: image as File,
            opening_days: openingDays,
        };

        const toastId = toaster.create({ title: "Đang lưu điểm...", type: "loading" });
        try {
            const created = await createPin(pinType.id, payload);
            onCreated(created);
            reset();
            onClose();
            toaster.update(toastId, { title: "Thêm điểm thành công!", type: "success", duration: 3000 });
        } catch {
            toaster.update(toastId, { title: "Thêm điểm thất bại.", description: "Vui lòng thử lại.", type: "error", duration: 4000 });
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
                    <Dialog.Content borderRadius="xl" p={6} maxW="600px" w="full" bg="white" position="relative">
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
                                <Heading size="md" color="gray.800">
                                    Thêm điểm mới
                                    {pinType && <Text as="span" ml={2} color="purple.600">({pinType.name})</Text>}
                                </Heading>
                            </Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <IconButton aria-label="Đóng" variant="ghost" size="sm" disabled={saving}>
                                    <LuX />
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>

                        <Dialog.Body px={0} maxH="60vh" overflowY="auto">
                            <Flex direction="column" gap={4} p={1}>
                                <Field.Root required invalid={!!errors.name}>
                                    <Field.Label fontSize="sm" color="gray.700">Tên điểm</Field.Label>
                                    <Input
                                        size="sm"
                                        placeholder="Ví dụ: Cây ATM Vietcombank..."
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setErrors((prev) => ({ ...prev, name: undefined }));
                                        }}
                                        color="black"
                                    />
                                    {errors.name && <Field.ErrorText color="red.500">{errors.name}</Field.ErrorText>}
                                </Field.Root>

                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <GridItem>
                                        <Field.Root required invalid={!!errors.lat}>
                                            <Field.Label fontSize="sm" color="gray.700">Vĩ độ (Lat)</Field.Label>
                                            <Input
                                                size="sm"
                                                type="number"
                                                step="any"
                                                placeholder="VD: 10.762622"
                                                value={lat}
                                                onChange={(e) => {
                                                    setLat(e.target.value);
                                                    setErrors((prev) => ({ ...prev, lat: undefined }));
                                                }}
                                                color="black"
                                            />
                                            {errors.lat && <Field.ErrorText color="red.500">{errors.lat}</Field.ErrorText>}
                                        </Field.Root>
                                    </GridItem>
                                    <GridItem>
                                        <Field.Root required invalid={!!errors.long}>
                                            <Field.Label fontSize="sm" color="gray.700">Kinh độ (Long)</Field.Label>
                                            <Input
                                                size="sm"
                                                type="number"
                                                step="any"
                                                placeholder="VD: 106.660172"
                                                value={long}
                                                onChange={(e) => {
                                                    setLong(e.target.value);
                                                    setErrors((prev) => ({ ...prev, long: undefined }));
                                                }}
                                                color="black"
                                            />
                                            {errors.long && <Field.ErrorText color="red.500">{errors.long}</Field.ErrorText>}
                                        </Field.Root>
                                    </GridItem>
                                </Grid>

                                <Field.Root required invalid={!!errors.address}>
                                    <Field.Label fontSize="sm" color="gray.700">Địa chỉ</Field.Label>
                                    <Input
                                        size="sm"
                                        placeholder="Nhập địa chỉ đầy đủ..."
                                        value={address}
                                        onChange={(e) => {
                                            setAddress(e.target.value);
                                            setErrors((prev) => ({ ...prev, address: undefined }));
                                        }}
                                        color="black"
                                    />
                                    {errors.address && <Field.ErrorText color="red.500">{errors.address}</Field.ErrorText>}
                                </Field.Root>

                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <GridItem>
                                        <Field.Root required invalid={!!errors.opening}>
                                            <Field.Label fontSize="sm" color="gray.700">Mở cửa lúc</Field.Label>
                                            <Input
                                                size="sm"
                                                type="time"
                                                value={opening}
                                                onChange={(e) => {
                                                    setOpening(e.target.value);
                                                    setErrors((prev) => ({ ...prev, opening: undefined }));
                                                }}
                                                color="black"
                                            />
                                            {errors.opening && <Field.ErrorText color="red.500">{errors.opening}</Field.ErrorText>}
                                        </Field.Root>
                                    </GridItem>
                                    <GridItem>
                                        <Field.Root required invalid={!!errors.closing}>
                                            <Field.Label fontSize="sm" color="gray.700">Đóng cửa lúc</Field.Label>
                                            <Input
                                                size="sm"
                                                type="time"
                                                value={closing}
                                                onChange={(e) => {
                                                    setClosing(e.target.value);
                                                    setErrors((prev) => ({ ...prev, closing: undefined }));
                                                }}
                                                color="black"
                                            />
                                            {errors.closing && <Field.ErrorText color="red.500">{errors.closing}</Field.ErrorText>}
                                        </Field.Root>
                                    </GridItem>
                                </Grid>

                                <Field.Root>
                                    <Flex align="center" gap={3}>
                                        <input
                                            type="checkbox"
                                            checked={isSponsored}
                                            onChange={(e) => setIsSponsored(e.target.checked)}
                                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                        />
                                        <Field.Label m={0} fontSize="sm" color="gray.700" cursor="pointer" onClick={() => setIsSponsored(!isSponsored)}>
                                            Là địa điểm được tài trợ (Sponsored)
                                        </Field.Label>
                                    </Flex>
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label fontSize="sm" color="gray.700">Chấp nhận (Accepts)</Field.Label>
                                    <Input
                                        size="sm"
                                        placeholder="VD: Ví điện tử, thẻ ngân hàng, tiền mặt"
                                        value={accepts}
                                        onChange={(e) => setAccepts(e.target.value)}
                                        color="black"
                                    />
                                    <Text fontSize="xs" color="gray.400" mt={1}>Phân cách bằng dấu phẩy</Text>
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label fontSize="sm" color="gray.700">Ngày mở cửa</Field.Label>
                                    <Flex gap={1} flexWrap="wrap">
                                        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label, i) => {
                                            const isActive = (openingDays >> i) & 1;
                                            return (
                                                <Button
                                                    key={label}
                                                    size="xs"
                                                    variant={isActive ? "solid" : "outline"}
                                                    bg={isActive ? "green.500" : undefined}
                                                    color={isActive ? "white" : "gray.500"}
                                                    _hover={{ bg: isActive ? "green.600" : "gray.100" }}
                                                    onClick={() => setOpeningDays(prev => prev ^ (1 << i))}
                                                    minW="36px"
                                                >
                                                    {label}
                                                </Button>
                                            );
                                        })}
                                    </Flex>
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label fontSize="sm" color="gray.700">Ảnh bìa (Banner)</Field.Label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                                        style={{ fontSize: "14px" }}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label fontSize="sm" color="gray.700">Điều khoản (Terms)</Field.Label>
                                    <Textarea
                                        size="sm"
                                        placeholder="Nhập điều khoản (nếu có)..."
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        color="black"
                                        rows={2}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label fontSize="sm" color="gray.700">Hướng dẫn (Instruction)</Field.Label>
                                    <Textarea
                                        size="sm"
                                        placeholder="Nhập hướng dẫn (nếu có)..."
                                        value={instruction}
                                        onChange={(e) => setInstruction(e.target.value)}
                                        color="black"
                                        rows={2}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label fontSize="sm" color="gray.700">Ghi chú (Note)</Field.Label>
                                    <Textarea
                                        size="sm"
                                        placeholder="Nhập ghi chú (nếu có)..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        color="black"
                                        rows={2}
                                    />
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer px={0} pb={0} pt={4}>
                            <Button variant="outline" size="sm" onClick={() => { reset(); onClose(); }} disabled={saving} color="black">
                                Huỷ
                            </Button>
                            <Button bg="purple.600" color="white" _hover={{ bg: "purple.700" }} size="sm" onClick={handleSave} disabled={saving} loading={saving}>
                                Trở thành điểm
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}