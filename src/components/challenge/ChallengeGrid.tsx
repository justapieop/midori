import type { JSX } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import type { Challenge } from "@/api/challenge";
import { ChallengeCard } from "./ChallengeCard";

export function ChallengeGrid({
    challenges,
    coverUrls,
    clickable,
    onSelect,
}: {
    challenges: Challenge[];
    coverUrls: Record<string, string>;
    clickable: boolean;
    onSelect: (c: Challenge) => void;
}): JSX.Element {
    return (
        <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={5}
        >
            {challenges.map((c) => (
                <GridItem key={c.id}>
                    <ChallengeCard
                        challenge={c}
                        coverUrl={coverUrls[c.id]}
                        clickable={clickable}
                        onSelect={onSelect}
                    />
                </GridItem>
            ))}
        </Grid>
    );
}
