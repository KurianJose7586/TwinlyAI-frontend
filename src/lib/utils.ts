/**
 * Generates a deterministic avatar URL using DiceBear Open Peeps.
 * @param seed - A unique string to generate the avatar from (usually a user or bot ID).
 * @returns A string URL pointing to the DiceBear API.
 */
export const getAvatarUrl = (seed: string | null) => {
    if (!seed) return "https://api.dicebear.com/7.x/open-peeps/svg?seed=fallback&backgroundColor=b6e3f4";
    // Using open-peeps to match the onboarding tool for a consistent look
    return `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
