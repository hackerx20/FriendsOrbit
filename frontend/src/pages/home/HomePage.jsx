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
    <div className="flex-[4_4_0] border-r border-base-300 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-base-100/80 backdrop-blur-md border-b border-base-300 z-10">
        <div className="flex">
          {feedTabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`flex-1 p-4 text-center cursor-pointer relative transition-colors ${
                feedType === tab.id 
                  ? 'text-primary font-semibold' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
              }`}
              onClick={() => setFeedType(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
              {feedType === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-12 h-1 bg-primary rounded-full"
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