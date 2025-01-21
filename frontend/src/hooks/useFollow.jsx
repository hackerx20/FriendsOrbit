import {useMutation , useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
const useFollow = () => {
    const queryClient =useQueryClient();
    const {mutate: follow, isPending} =useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch("/api/auth/logout",{
                    method:"POST",
                });
                const data = await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong");
                }
                return;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            // toast.success("comment successfully Updated");
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["suggestedUsers"] }),
                queryClient.invalidateQueries({queryKey: ["authUser"] }),
            ]);
            
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    return {follow, isPending};
};
export default useFollow;