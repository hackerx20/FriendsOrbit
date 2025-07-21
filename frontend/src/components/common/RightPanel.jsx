import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MdVerified } from "react-icons/md";

import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
     try {
       const res = await fetch("/api/users/suggested");
       
       if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
       }
       
       const text = await res.text();
       if (!text) {
         return [];
       }
       
       const data = JSON.parse(text);
       return data;
     } catch (error) {
       console.error("Suggested users error:", error);
       return [];
     }
    },
  });

  const { follow, isPending } = useFollow();

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  return (
    <div className="hidden lg:block w-80 p-4 sticky top-0 h-screen overflow-y-auto">
      <div className="bg-base-200 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-base-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-base-300 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-base-300 rounded w-16"></div>
                </div>
                <div className="w-16 h-8 bg-base-300 rounded-full"></div>
              </div>
            ))
          ) : (
            suggestedUsers?.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-300/50 transition-colors"
              >
                <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img 
                        src={user.profile_image || "/avatar-placeholder.png"} 
                        alt={user.username}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">
                        {user.full_name}
                      </p>
                      {user.is_verified && (
                        <MdVerified className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-base-content/60 truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary btn-sm rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    follow(user.id);
                  }}
                  disabled={isPending}
                >
                  {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                </motion.button>
              </motion.div>
            ))
          )}
        </div>

        {/* Trending Topics */}
        <div className="mt-6 pt-4 border-t border-base-300">
          <h3 className="font-bold mb-3">Trending</h3>
          <div className="space-y-2">
            {["#ReactJS", "#WebDev", "#AI", "#TechNews"].map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-2 rounded-lg hover:bg-base-300/50 cursor-pointer transition-colors"
              >
                <p className="text-sm font-medium text-primary">{tag}</p>
                <p className="text-xs text-base-content/60">
                  {Math.floor(Math.random() * 50) + 10}K posts
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;