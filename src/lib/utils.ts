/**
 * Generates a deterministic avatar URL using DiceBear Notionists.
 * @param seed - A unique string to generate the avatar from (usually a user or bot ID).
 * @returns A string URL pointing to the DiceBear API.
 */
export const getAvatarUrl = (seed: string | null) => {
    if (!seed) return "https://api.dicebear.com/7.x/notionists/svg?seed=fallback";
    // Using notionists for a professional look
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
};
