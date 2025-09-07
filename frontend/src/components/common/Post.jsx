import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "../../context/SocketContext";

// Icons
import { 
  MdFavorite, 
  MdFavoriteBorder, 
  MdComment, 
  MdShare, 
  MdDelete,
  MdVerified,
  MdSend,
  MdMoreVert
} from "react-icons/md";

import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count || 0);
  const queryClient = useQueryClient();
  const { socket, feedUpdates } = useSocket();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyPost = authUser?.id === post.user_id;
  const isLiked = false; // TODO: Implement like status check
  
  // Handle real-time updates for this post
  useEffect(() => {
    const postUpdates = feedUpdates.filter(update => 
      (update.type === 'post_liked' && update.data.postId === post.id) ||
      (update.type === 'new_comment' && update.data.postId === post.id)
    );
    
    postUpdates.forEach(update => {
      if (update.type === 'post_liked') {
        setLocalLikesCount(update.data.likesCount);
      } else if (update.type === 'new_comment') {
        setLocalCommentsCount(prev => prev + 1);
      }
    });
  }, [feedUpdates, post.id]);

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
    
    // Emit real-time update
    if (socket) {
      socket.emit('post_liked', {
        postId: post.id,
        userId: authUser.id,
        likesCount: localLikesCount + (isLiked ? -1 : 1)
      });
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment.trim());
    
    // Emit real-time update
    if (socket) {
      socket.emit('new_comment', {
        postId: post.id,
        comment: {
          content: comment.trim(),
          user: authUser
        }
      });
    }
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="border-b border-base-300 bg-base-100">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/profile/${post.username}`} className="flex-shrink-0 p-4 pb-0">
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
        <div className="flex-1 min-w-0 p-4 pl-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/profile/${post.username}`}
              className="font-bold hover:underline flex items-center gap-1 text-base-content"
            >
              {post.full_name}
              {post.is_verified && (
                <MdVerified className="w-4 h-4 text-primary" />
              )}
            </Link>
            <span className="text-base-content/50">·</span>
            <Link 
              to={`/profile/${post.username}`}
              className="text-base-content/50 hover:underline text-sm"
            >
              @{post.username}
            </Link>
            <span className="text-base-content/50">·</span>
            <time className="text-base-content/50 text-sm">
              {formatDate(post.created_at)}
            </time>
            
            {/* More options */}
            <div className="ml-auto">
              <div className="dropdown dropdown-end">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  tabIndex={0}
                  className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content hover:bg-base-200"
                >
                  <MdMoreVert className="w-5 h-5" />
                </motion.button>
                {isMyPost && (
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                    <li>
                      <button 
                        onClick={handleDeletePost}
                        className="text-error hover:bg-error/10"
                        disabled={deletePostMutation.isPending}
                      >
                        {deletePostMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <MdDelete className="w-4 h-4" />
                            Delete Post
                          </>
                        )}
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Post Text */}
          {post.content && (
            <div className="mb-4">
              <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{post.content}</p>
            </div>
          )}

          {/* Post Image */}
          {post.image_url && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-base-300 bg-base-200">
              <img 
                src={post.image_url} 
                alt="Post content"
                className="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => window.open(post.image_url, '_blank')}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-4 pt-2 border-t border-base-300/50">
            {/* Comments */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <MdComment className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{localCommentsCount}</span>
            </motion.button>

            {/* Likes */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikePost}
              className={`flex items-center gap-2 transition-colors group ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-base-content/60 hover:text-red-500'
              }`}
              disabled={likePostMutation.isPending}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                {likePostMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : isLiked ? (
                  <MdFavorite className="w-5 h-5" />
                ) : (
                  <MdFavoriteBorder className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm font-medium">{localLikesCount}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-base-content/60 hover:text-primary transition-colors group"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
                toast.success('Link copied to clipboard!');
              }}
            >
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
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
              className="mt-6 space-y-4 border-t border-base-300/50 pt-4"
            >
              {/* Comment Form */}
              <form onSubmit={handleComment} className="flex gap-3 bg-base-200/50 rounded-xl p-3">
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
                    className="input input-bordered input-sm flex-1 bg-base-100 border-base-300 focus:border-primary"
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
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 p-3 rounded-xl hover:bg-base-200/30 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img 
                            src={comment.profile_image || "/avatar-placeholder.png"} 
                            alt={comment.username}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link 
                            to={`/profile/${comment.username}`}
                            className="font-semibold text-sm hover:underline text-base-content"
                          >
                            {comment.full_name}
                          </Link>
                          <span className="text-xs text-base-content/50">
                            @{comment.username}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;