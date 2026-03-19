import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

// Hook to fetch data
export const useUserProfile = () => {
    return useQuery({
        queryKey: ["user", "profile"],
        queryFn: UserService.getProfile,
        retry: 1,         // fail fast if 401
        staleTime: 5 * 60 * 1000, // 5 min — prevents constant refetch loop on error
    });
};

// Hook to mutate data
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserService.updateProfile,
        onSuccess: (updatedData) => {
            // Instantly update the UI cache
            queryClient.setQueryData(["user", "profile"], updatedData);
        }
    });
};
