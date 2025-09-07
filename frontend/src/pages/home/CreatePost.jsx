import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Icons
import { MdImage, MdClose, MdEmojiEmotions } from 'react-icons/md';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSocket } from '../../context/SocketContext';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const imageRef = useRef(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

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
      
      // Emit real-time update
      if (socket) {
        socket.emit('new_post', {
          content,
          image,
          user: authUser
        });
      }
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
    <div className="border-b border-base-300 bg-base-100 shadow-sm">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="avatar p-4 pb-0">
          <div className="w-14 rounded-full ring-2 ring-primary/20">
            <img 
              src={authUser?.profileImage || '/avatar-placeholder.png'} 
              alt={authUser?.username}
            />
          </div>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 pl-0">
          <div className="space-y-6">
            {/* Text Input */}
            <textarea
              className="textarea textarea-ghost w-full text-xl resize-none min-h-[140px] focus:outline-none placeholder:text-base-content/40 leading-relaxed"
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
                className="relative rounded-3xl overflow-hidden border border-base-300 shadow-lg bg-base-200"
              >
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full max-h-96 object-cover"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 btn btn-circle btn-sm bg-black/60 border-none text-white hover:bg-black/80 backdrop-blur-sm"
                >
                  <MdClose />
                </motion.button>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-base-300/30">
              <div className="flex items-center gap-3">
                {/* Image Upload */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  className="btn btn-ghost btn-circle text-primary hover:bg-primary/10 transition-colors"
                  title="Add image"
                >
                  <MdImage className="w-6 h-6" />
                </motion.button>

                {/* Emoji Button (placeholder) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="btn btn-ghost btn-circle text-primary hover:bg-primary/10 transition-colors"
                  title="Add emoji"
                >
                  <MdEmojiEmotions className="w-6 h-6" />
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
              <div className="flex items-center gap-4">
                {content && (
                  <div className="flex items-center gap-2">
                    <div className={`radial-progress text-xs ${
                      content.length > 1800 ? 'text-warning' : 
                      content.length > 1600 ? 'text-info' : 'text-primary'
                    }`} 
                    style={{"--value": (content.length / 2000) * 100, "--size": "2rem"}}>
                      {content.length > 1800 && (2000 - content.length)}
                    </div>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn btn-primary rounded-full px-8 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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