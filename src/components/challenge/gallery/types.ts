export interface GalleryEntry {
    url: string;
    createdAt: Date;
}

export interface DateGroup {
    label: string;
    date: Date;
    entries: GalleryEntry[];
}

function localDateKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function fullLabel(d: Date): string {
    return d.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function groupByDate(entries: GalleryEntry[]): DateGroup[] {
    const map = new Map<string, { date: Date; entries: GalleryEntry[] }>();
    for (const entry of entries) {
        const key = localDateKey(entry.createdAt);
        if (!map.has(key)) {
            const d = new Date(entry.createdAt);
            d.setHours(0, 0, 0, 0);
            map.set(key, { date: d, entries: [] });
        }
        map.get(key)!.entries.push(entry);
    }
    return Array.from(map.values()).map(({ date, entries }) => ({
        label: fullLabel(date),
        date,
        entries,
    }));
}

export function generateDateRange(startsAt: Date, endsAt: Date, entries: GalleryEntry[]): DateGroup[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endClamped = new Date(Math.min(endsAt.getTime(), today.getTime()));

    // Map local date key -> entries
    const map = new Map<string, GalleryEntry[]>();
    for (const entry of entries) {
        const key = localDateKey(entry.createdAt);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(entry);
    }

    const groups: DateGroup[] = [];
    const current = new Date(startsAt);
    current.setHours(0, 0, 0, 0);

    while (current <= endClamped) {
        const key = localDateKey(current);
        groups.push({
            label: fullLabel(current),
            date: new Date(current),
            entries: map.get(key) ?? [],
        });
        current.setDate(current.getDate() + 1);
    }

    return groups;
}
