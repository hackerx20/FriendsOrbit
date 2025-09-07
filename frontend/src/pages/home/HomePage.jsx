import { useState } from "react";
import { motion } from "framer-motion";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  const feedTabs = [
    { id: "forYou", label: "For You" },
    { id: "following", label: "Following" },
    { id: "recommended", label: "Recommended" },
    { id: "trending", label: "Trending" }
  ];

  return (
    <div className="flex-[4_4_0] border-r border-base-300 min-h-screen bg-base-100">
      {/* Header */}
      <div className="sticky top-0 bg-base-100/90 backdrop-blur-xl border-b border-base-300/50 z-10 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {feedTabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`flex-shrink-0 px-6 py-4 text-center cursor-pointer relative transition-all duration-300 min-w-fit ${
                feedType === tab.id 
                  ? 'text-primary font-semibold text-base' 
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-200/30 font-medium text-sm'
              }`}
              onClick={() => setFeedType(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
              {feedType === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-12 h-0.5 bg-primary rounded-full"
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