import type { JSX } from "react";
import {
    Box,
    Button,
    Flex,
    Heading,
    Icon,
    Image,
    Separator,
    Text,
} from "@chakra-ui/react";
import { LuCalendar, LuCircleUser, LuSettings, LuShield, LuStar } from "react-icons/lu";
import type { UserProfile } from "@/api/user";
import { StatCard } from "./StatCard";
import { BioEditor } from "./BioEditor";

interface ProfileCardProps {
    profile: UserProfile;
    displayName: string;
    joinedDate: string;
    bioValue: string;
    bioEditing: boolean;
    onBioChange: (value: string) => void;
    onBioSave: () => void;
    onBioCancel: () => void;
    onBioEdit: () => void;
}

export function ProfileCard({
    profile,
    displayName,
    joinedDate,
    bioValue,
    bioEditing,
    onBioChange,
    onBioSave,
    onBioCancel,
    onBioEdit,
}: ProfileCardProps): JSX.Element {
    return (
        <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            mb={6}
        >
            {/* Avatar + name */}
            <Flex direction="column" align="center" pt={8} pb={6} px={6} gap={3}>
                {profile.avatar_url ? (
                    <Image
                        src={profile.avatar_url}
                        alt={displayName}
                        boxSize="96px"
                        borderRadius="full"
                        objectFit="cover"
                        border="4px solid white"
                        boxShadow="md"
                    />
                ) : (
                    <Flex
                        boxSize="96px"
                        borderRadius="full"
                        bg="gray.100"
                        align="center"
                        justify="center"
                        color="gray.400"
                        border="4px solid white"
                        boxShadow="md"
                    >
                        <Icon as={LuCircleUser} boxSize={10} />
                    </Flex>
                )}

                <Box textAlign="center">
                    <Flex align="center" justify="center" gap={2}>
                        <Heading size="lg" color="gray.900">{displayName}</Heading>
                        {profile.admin && (
                            <Flex
                                align="center"
                                gap={1}
                                bg="purple.50"
                                border="1px solid"
                                borderColor="purple.200"
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="xs"
                                color="purple.700"
                                fontWeight="medium"
                            >
                                <Icon as={LuShield} boxSize={3} />
                                <Text>Admin</Text>
                            </Flex>
                        )}
                    </Flex>
                </Box>

                <BioEditor
                    bioValue={bioValue}
                    editing={bioEditing}
                    onBioChange={onBioChange}
                    onSave={onBioSave}
                    onCancel={onBioCancel}
                    onEdit={onBioEdit}
                />
            </Flex>

            <Separator />

            {/* Stats row */}
            <Flex p={5} gap={4} flexWrap="wrap">
                <StatCard
                    icon={<Icon as={LuStar} boxSize={4} />}
                    label="Điểm tích lũy"
                    value={profile.points}
                />
                <StatCard
                    icon={<Icon as={LuCalendar} boxSize={4} />}
                    label="Ngày tham gia"
                    value={joinedDate}
                />
            </Flex>

            <Separator />

            <Flex p={5} justify="flex-end">
                <Button
                    size="sm"
                    colorPalette="green"
                    borderRadius="xl"
                    gap={2}
                    color="white"
                    onClick={() => window.open(import.meta.env.VITE_AUTHGEAR_ENDPOINT, "_blank")}
                >
                    <LuSettings />
                    Chỉnh sửa tài khoản
                </Button>
            </Flex>
        </Box>
    );
}
