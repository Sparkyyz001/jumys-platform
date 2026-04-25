// Approximate center coordinates of Aktau microdistricts (1-39).
// Aktau city is roughly 43.65N 51.16E. Districts are arranged in a grid
// from south (1) to north (39); coordinates here are approximations
// suitable for showing markers, not for navigation.

export const AKTAU_CENTER: [number, number] = [51.1605, 43.6532];

const RAW: Record<string, [number, number]> = {
    "1": [51.155, 43.626],
    "2": [51.166, 43.628],
    "3": [51.176, 43.629],
    "4": [51.156, 43.636],
    "5": [51.171, 43.636],
    "6": [51.184, 43.638],
    "7": [51.142, 43.642],
    "8": [51.156, 43.644],
    "9": [51.171, 43.644],
    "10": [51.183, 43.646],
    "11": [51.146, 43.65],
    "12": [51.16, 43.652],
    "13": [51.176, 43.652],
    "14": [51.19, 43.652],
    "15": [51.144, 43.658],
    "16": [51.158, 43.658],
    "17": [51.176, 43.658],
    "18": [51.192, 43.66],
    "19": [51.143, 43.665],
    "20": [51.157, 43.665],
    "21": [51.176, 43.668],
    "22": [51.193, 43.667],
    "23": [51.145, 43.673],
    "24": [51.158, 43.674],
    "25": [51.18, 43.676],
    "26": [51.197, 43.674],
    "27": [51.144, 43.682],
    "28": [51.157, 43.683],
    "29": [51.177, 43.685],
    "30": [51.197, 43.683],
    "31": [51.146, 43.692],
    "32": [51.158, 43.692],
    "33": [51.179, 43.694],
    "34": [51.198, 43.692],
    "35": [51.146, 43.701],
    "36": [51.158, 43.704],
    "37": [51.18, 43.703],
    "38": [51.197, 43.7],
    "39": [51.205, 43.71],
};

export function districtToLngLat(district: string | null | undefined): [number, number] | null {
    if (!district) return null;
    const key = district.replace(/[^0-9]/g, "");
    return RAW[key] ?? null;
}

export function jitter(coord: [number, number], seed: number): [number, number] {
    // Tiny deterministic spread so multiple jobs in same district aren't stacked
    const r = ((seed * 9301 + 49297) % 233280) / 233280;
    const r2 = ((seed * 7919 + 12345) % 233280) / 233280;
    return [coord[0] + (r - 0.5) * 0.004, coord[1] + (r2 - 0.5) * 0.004];
}
