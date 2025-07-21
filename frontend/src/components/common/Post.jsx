import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

// Icons
import { 
  MdFavorite, 
  MdFavoriteBorder, 
  MdComment, 
  MdShare, 
  MdDelete,
  MdVerified,
  MdSend
} from "react-icons/md";

import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyPost = authUser?.id === post.user_id;
  const isLiked = false; // TODO: Implement like status check

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content) => {
      const res = await fetch(`/api/posts/comment/${post.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setComment("");
      toast.success("Comment added successfully");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate();
    }
  };

  const handleLikePost = () => {
    likePostMutation.mutate();
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment.trim());
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-base-300 p-4 hover:bg-base-100/50 transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/profile/${post.username}`} className="flex-shrink-0">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img 
                src={post.profile_image || "/avatar-placeholder.png"} 
                alt={post.username}
              />
            </div>
          </div>
        </Link>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/profile/${post.username}`}
              className="font-semibold hover:underline flex items-center gap-1"
            >
              {post.full_name}
              {post.is_verified && (
                <MdVerified className="w-4 h-4 text-primary" />
              )}
            </Link>
            <span className="text-base-content/60">·</span>
            <Link 
              to={`/profile/${post.username}`}
              className="text-base-content/60 hover:underline"
            >
              @{post.username}
            </Link>
            <span className="text-base-content/60">·</span>
            <time className="text-base-content/60 text-sm">
              {formatDate(post.created_at)}
            </time>
            
            {/* Delete button for own posts */}
            {isMyPost && (
              <div className="ml-auto">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDeletePost}
                  className="btn btn-ghost btn-sm btn-circle text-error"
                  disabled={deletePostMutation.isPending}
                >
                  {deletePostMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <MdDelete />
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Post Text */}
          {post.content && (
            <div className="mb-3">
              <p className="whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          )}

          {/* Post Image */}
          {post.image_url && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-base-300">
              <img 
                src={post.image_url} 
                alt="Post content"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Comments */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors"
            >
              <div className="p-2 rounded-full hover:bg-primary/10">
                <MdComment className="w-5 h-5" />
              </div>
              <span className="text-sm">{post.comments_count || 0}</span>
            </motion.button>

            {/* Likes */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikePost}
              className={`flex items-center gap-2 transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-base-content/60 hover:text-red-500'
              }`}
              disabled={likePostMutation.isPending}
            >
              <div className="p-2 rounded-full hover:bg-red-500/10">
                {likePostMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : isLiked ? (
                  <MdFavorite className="w-5 h-5" />
                ) : (
                  <MdFavoriteBorder className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm">{post.likes_count || 0}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors"
            >
              <div className="p-2 rounded-full hover:bg-primary/10">
                <MdShare className="w-5 h-5" />
              </div>
            </motion.button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {/* Comment Form */}
              <form onSubmit={handleComment} className="flex gap-3">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img 
                      src={authUser?.profileImage || "/avatar-placeholder.png"} 
                      alt={authUser?.username}
                    />
                  </div>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="input input-bordered input-sm flex-1"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn btn-primary btn-sm btn-circle"
                    disabled={!comment.trim() || commentMutation.isPending}
                  >
                    {commentMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <MdSend className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Comments List */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-3 pl-11">
                  {post.comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="avatar">
                        <div className="w-6 rounded-full">
                          <img 
                            src={comment.profile_image || "/avatar-placeholder.png"} 
                            alt={comment.username}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link 
                            to={`/profile/${comment.username}`}
                            className="font-medium text-sm hover:underline"
                          >
                            {comment.full_name}
                          </Link>
                          <span className="text-xs text-base-content/60">
                            @{comment.username}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default Post;