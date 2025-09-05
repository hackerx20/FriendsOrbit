import { useState } from "react";
import { motion } from "framer-motion";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  const feedTabs = [
    { id: "forYou", label: "For You" },
    { id: "following", label: "Following" }
  ];

  return (
    <div className="flex-[4_4_0] border-r border-base-300 min-h-screen bg-base-100">
      {/* Header */}
      <div className="sticky top-0 bg-base-100/90 backdrop-blur-xl border-b border-base-300/50 z-10 shadow-sm">
        <div className="flex">
          {feedTabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`flex-1 p-6 text-center cursor-pointer relative transition-all duration-300 ${
                feedType === tab.id 
                  ? 'text-primary font-bold text-lg' 
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-200/30 font-semibold'
              }`}
              onClick={() => setFeedType(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
              {feedType === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg"
                  layoutId="activeTab"
                  initial={false}
                  style={{ x: '-50%' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Post */}
      <CreatePost />

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </div>
  );
};

export default HomePage;