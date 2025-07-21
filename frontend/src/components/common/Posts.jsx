import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "framer-motion";

import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async () => {
      const res = await fetch(POST_ENDPOINT);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  if (isLoading || isRefetching) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="text-base-content/60">
          {feedType === "following" 
            ? "Follow some users to see their posts here" 
            : "Be the first to share something!"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Post post={post} />
        </motion.div>
      ))}
    </div>
  );
};

export default Posts;