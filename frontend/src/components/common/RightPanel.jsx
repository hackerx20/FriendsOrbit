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
    <div className="hidden lg:block w-80 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="bg-base-200/50 backdrop-blur-md rounded-3xl p-6 border border-base-300/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Who to follow</h2>
        
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse p-3 rounded-2xl">
                <div className="w-14 h-14 bg-base-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-base-300 rounded-full w-28 mb-2"></div>
                  <div className="h-3 bg-base-300 rounded-full w-20"></div>
                </div>
                <div className="w-20 h-9 bg-base-300 rounded-full"></div>
              </div>
            ))
          ) : (
            suggestedUsers?.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-base-300/30 transition-all duration-300 group cursor-pointer"
              >
                <Link to={`/profile/${user.username}`} className="flex items-center gap-4 flex-1">
                  <div className="avatar">
                    <div className="w-14 rounded-full ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300">
                      <img 
                        src={user.profile_image || "/avatar-placeholder.png"} 
                        alt={user.username}
                        className="hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-base truncate text-base-content group-hover:text-primary transition-colors">
                        {user.full_name}
                      </p>
                      {user.is_verified && (
                        <MdVerified className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-base-content/50 truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary btn-sm rounded-full px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
        <div className="mt-8 pt-6 border-t border-base-300/50">
          <h3 className="font-bold mb-4 text-lg text-base-content">Trending</h3>
          <div className="space-y-3">
            {["#ReactJS", "#WebDev", "#AI", "#TechNews"].map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-2xl hover:bg-base-300/30 cursor-pointer transition-all duration-300 group"
              >
                <p className="text-base font-bold text-primary group-hover:text-primary/80 transition-colors">{tag}</p>
                <p className="text-sm text-base-content/50">
                  {Math.floor(Math.random() * 50) + 10}K posts
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-base-300/50">
          <div className="flex flex-wrap gap-2 text-xs text-base-content/40">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-primary transition-colors">About</a>
          </div>
          <p className="text-xs text-base-content/40 mt-2">© 2024 FriendsOrbit</p>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;