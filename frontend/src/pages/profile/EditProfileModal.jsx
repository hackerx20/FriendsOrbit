import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { MdClose, MdEdit } from "react-icons/md";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const EditProfileModal = ({ authUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    websiteUrl: "",
    newPassword: "",
    currentPassword: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['authUser']);
      queryClient.invalidateQueries(['userProfile']);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only send non-empty fields
    const updates = {};
    if (formData.fullName.trim()) updates.fullName = formData.fullName.trim();
    if (formData.bio.trim()) updates.bio = formData.bio.trim();
    if (formData.websiteUrl.trim()) updates.websiteUrl = formData.websiteUrl.trim();
    if (formData.currentPassword && formData.newPassword) {
      updates.currentPassword = formData.currentPassword;
      updates.newPassword = formData.newPassword;
    }
    
    updateProfileMutation.mutate(updates);
  };

  useEffect(() => {
    if (authUser && isOpen) {
      setFormData({
        fullName: authUser.fullName || "",
        bio: authUser.bio || "",
        websiteUrl: authUser.websiteUrl || "",
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser, isOpen]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-outline btn-sm rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <MdEdit className="w-4 h-4" />
        Edit Profile
      </motion.button>

      {isOpen && (
        <div className="modal modal-open">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-box max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Edit Profile</h3>
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => setIsOpen(false)}
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself..."
                  className="textarea textarea-bordered w-full h-24 resize-none"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    {formData.bio.length}/500 characters
                  </span>
                </label>
              </div>

              {/* Website URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Website</span>
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  placeholder="https://yourwebsite.com"
                  className="input input-bordered w-full"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                />
              </div>

              {/* Password Change */}
              <div className="divider">Change Password (Optional)</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Current Password</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    className="input input-bordered w-full"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">New Password</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    className="input input-bordered w-full"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    minLength={8}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsOpen(false)}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          
          <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
            <button>close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileModal;