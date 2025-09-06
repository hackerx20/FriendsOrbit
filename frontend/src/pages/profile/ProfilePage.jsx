import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Icons
import { 
  MdArrowBack, 
  MdCalendarToday, 
  MdEdit, 
  MdLocationOn,
  MdLink,
  MdVerified
} from "react-icons/md";

import useFollow from "../../hooks/useFollow";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const queryClient = useQueryClient();

  const { username } = useParams();
  const { follow, isPending: isFollowPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("User not found");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const text = await res.text();
        if (!text) {
          throw new Error("No data received");
        }
        
        const data = JSON.parse(text);
        return data;
      } catch (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
    },
    enabled: !!username
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['authUser']);
      queryClient.invalidateQueries(['userProfile']);
      setCoverImg(null);
      setProfileImg(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const isMyProfile = authUser?.id === user?.id;
  const isFollowing = user?.isFollowing;
  
  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    const updates = {};
    if (coverImg) updates.coverImage = coverImg;
    if (profileImg) updates.profileImage = profileImg;
    updateProfileMutation.mutate(updates);
  };

  const formatJoinDate = (dateString) => {
    return format(new Date(dateString), 'MMMM yyyy');
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  if (isLoading || isRefetching) {
    return (
      <div className="flex-[4_4_0] border-r border-base-300 min-h-screen">
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-[4_4_0] border-r border-base-300 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-base-content/60">The profile you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[4_4_0] border-r border-base-300 min-h-screen bg-base-100">
      {/* Header */}
      <div className="sticky top-0 bg-base-100/90 backdrop-blur-xl border-b border-base-300/50 z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn btn-ghost btn-circle"
            >
              <MdArrowBack className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{user.fullName}</h1>
            <p className="text-sm text-base-content/60">0 posts</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex flex-col">
        {/* Cover Image */}
        <div className="relative group/cover">
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
            <img
              src={coverImg || user.coverImage || "/cover.png"}
              className="w-full h-full object-cover"
              alt="Cover"
            />
          </div>
          {isMyProfile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 btn btn-circle btn-sm bg-black/60 border-none text-white hover:bg-black/80 opacity-0 group-hover/cover:opacity-100 transition-opacity"
              onClick={() => coverImgRef.current?.click()}
            >
              <MdEdit className="w-4 h-4" />
            </motion.button>
          )}

          {/* Profile Image */}
          <div className="absolute -bottom-16 left-4">
            <div className="avatar">
              <div className="w-32 rounded-full ring-4 ring-base-100 bg-base-100 relative group/avatar">
                <img 
                  src={profileImg || user.profileImage || "/avatar-placeholder.png"} 
                  alt={user.username}
                />
                {isMyProfile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-2 right-2 btn btn-circle btn-xs bg-primary border-none text-primary-content opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                    onClick={() => profileImgRef.current?.click()}
                  >
                    <MdEdit className="w-3 h-3" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            type="file"
            hidden
            accept="image/*"
            ref={coverImgRef}
            onChange={(e) => handleImgChange(e, "coverImg")}
          />
          <input
            type="file"
            hidden
            accept="image/*"
            ref={profileImgRef}
            onChange={(e) => handleImgChange(e, "profileImg")}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end p-4 mt-4">
          {isMyProfile ? (
            <div className="flex gap-2">
              <EditProfileModal authUser={authUser} />
              {(coverImg || profileImg) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary btn-sm rounded-full"
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn btn-sm rounded-full px-6 ${
                isFollowing ? 'btn-outline' : 'btn-primary'
              }`}
              onClick={() => follow(user.id)}
              disabled={isFollowPending}
            >
              {isFollowPending ? (
                <LoadingSpinner size="sm" />
              ) : isFollowing ? (
                'Unfollow'
              ) : (
                'Follow'
              )}
            </motion.button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              {user.isVerified && (
                <MdVerified className="w-6 h-6 text-primary" />
              )}
            </div>
            <p className="text-base-content/60">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-base leading-relaxed">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
            {user.websiteUrl && (
              <a 
                href={user.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <MdLink className="w-4 h-4" />
                {user.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            <div className="flex items-center gap-1">
              <MdCalendarToday className="w-4 h-4" />
              Joined {formatJoinDate(user.createdAt)}
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-bold">{user.followingCount || 0}</span>
              <span className="text-base-content/60">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">{user.followersCount || 0}</span>
              <span className="text-base-content/60">Followers</span>
            </div>
          </div>
        </div>

        {/* Feed Tabs */}
        <div className="flex border-b border-base-300">
          {[
            { id: 'posts', label: 'Posts' },
            { id: 'likes', label: 'Likes' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`flex-1 p-4 text-center font-semibold transition-colors relative ${
                feedType === tab.id 
                  ? 'text-primary' 
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-200/30'
              }`}
              onClick={() => setFeedType(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
              {feedType === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-16 h-1 bg-primary rounded-full"
                  layoutId="activeProfileTab"
                  initial={false}
                  style={{ x: '-50%' }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Posts */}
        <Posts feedType={feedType} username={username} userId={user.id} />
      </div>
    </div>
  );
};

export default ProfilePage;