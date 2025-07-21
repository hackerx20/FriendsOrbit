import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Icons
import { MdImage, MdClose, MdEmojiEmotions } from 'react-icons/md';

import LoadingSpinner from '../../components/common/LoadingSpinner';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const imageRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  const createPostMutation = useMutation({
    mutationFn: async ({ content, image }) => {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, image })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setContent('');
      setImage(null);
      toast.success('Post created successfully!');
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      toast.error('Please add some content or an image');
      return;
    }
    createPostMutation.mutate({ content: content.trim(), image });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imageRef.current) {
      imageRef.current.value = '';
    }
  };

  return (
    <div className="border-b border-base-300 p-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img 
              src={authUser?.profileImage || '/avatar-placeholder.png'} 
              alt={authUser?.username}
            />
          </div>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="space-y-4">
            {/* Text Input */}
            <textarea
              className="textarea textarea-ghost w-full text-lg resize-none min-h-[120px] focus:outline-none placeholder:text-base-content/50"
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />

            {/* Image Preview */}
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-2xl overflow-hidden border border-base-300"
              >
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full max-h-80 object-cover"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70"
                >
                  <MdClose />
                </motion.button>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {/* Image Upload */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  className="btn btn-ghost btn-circle btn-sm text-primary"
                  title="Add image"
                >
                  <MdImage className="w-5 h-5" />
                </motion.button>

                {/* Emoji Button (placeholder) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="btn btn-ghost btn-circle btn-sm text-primary"
                  title="Add emoji"
                >
                  <MdEmojiEmotions className="w-5 h-5" />
                </motion.button>

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={imageRef}
                  onChange={handleImageChange}
                />
              </div>

              {/* Character Count & Post Button */}
              <div className="flex items-center gap-3">
                {content && (
                  <div className={`text-sm ${content.length > 1800 ? 'text-warning' : 'text-base-content/60'}`}>
                    {content.length}/2000
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn btn-primary btn-sm rounded-full px-6"
                  disabled={(!content.trim() && !image) || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Post'
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;