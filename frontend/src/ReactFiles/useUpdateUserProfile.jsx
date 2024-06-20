import {useMutation , useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
const useUpdateUserProfile = () => {
    const queryClient =useQueryClient();
    const {mutateAsync: updateProfile, isPending: isUpdatingProfile} =useMutation({
        mutationFn: async (FormData) => {
            try {
                const res = await fetch("/api/auth/logout",{
                    method:"POST",
                    headers:{
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(FormData),
                });
                const data = await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong");
                }
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            toast.success("comment successfully Updated");
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["authUser"] }),
                queryClient.invalidateQueries({queryKey: ["userProfile"] }),
            ]);
            
        },
        onError: () => {
            toast.error("Logout Failed");
        },
    });
    return {updateProfile , isUpdatingProfile};
};
export default useUpdateUserProfile;