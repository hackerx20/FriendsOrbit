/*
  # Create Demo Data for FriendsOrbit

  1. Demo Users
    - Creates 10 demo users with realistic profiles
    - Includes profile images and cover images
    - Various bio descriptions and verification status

  2. Demo Posts
    - Creates sample posts with text and images
    - Distributes posts across different users
    - Includes various content types

  3. Demo Interactions
    - Creates follow relationships between users
    - Adds likes and comments to posts
    - Sets up conversations and messages

  4. Demo AI Chat Sessions
    - Creates sample AI chat sessions
    - Includes conversation history
*/

-- Insert demo users
INSERT INTO users (username, full_name, email, password_hash, bio, profile_image, cover_image, website_url, is_verified) VALUES
('john_doe', 'John Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Software Developer | Tech Enthusiast | Coffee Lover ☕', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://johndoe.dev', true),
('jane_smith', 'Jane Smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'UI/UX Designer | Creative Mind | Nature Lover 🌿', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://janesmith.design', true),
('alex_chen', 'Alex Chen', 'alex@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Data Scientist | AI Researcher | Marathon Runner 🏃‍♂️', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1200', '', false),
('sarah_wilson', 'Sarah Wilson', 'sarah@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Marketing Manager | Travel Enthusiast | Foodie 🍕', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://sarahwilson.blog', false),
('mike_johnson', 'Mike Johnson', 'mike@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Photographer | Visual Storyteller | Adventure Seeker 📸', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://mikejohnson.photo', true),
('emma_davis', 'Emma Davis', 'emma@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Product Manager | Tech Leader | Yoga Instructor 🧘‍♀️', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200', '', false),
('david_brown', 'David Brown', 'david@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Full Stack Developer | Open Source Contributor | Gamer 🎮', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://github.com/davidbrown', false),
('lisa_garcia', 'Lisa Garcia', 'lisa@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Content Creator | Writer | Book Lover 📚', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://lisagarcia.medium.com', true),
('tom_anderson', 'Tom Anderson', 'tom@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Entrepreneur | Startup Founder | Mentor 💡', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://tomanderson.co', false),
('amy_taylor', 'Amy Taylor', 'amy@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Graphic Designer | Artist | Coffee Addict ☕', 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://amytaylor.art', false);

-- Insert demo posts
INSERT INTO posts (user_id, content, image_url, likes_count, comments_count) VALUES
(1, 'Just finished building a new React component library! 🚀 The developer experience is amazing. Can''t wait to share it with the community. #ReactJS #OpenSource', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800', 15, 3),
(2, 'Working on a new design system for our mobile app. The color palette is inspired by nature 🌿✨ What do you think about using earth tones in modern UI?', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800', 23, 7),
(3, 'Machine learning model training complete! 📊 Achieved 94% accuracy on the test dataset. Time to deploy to production. #MachineLearning #AI', NULL, 31, 5),
(4, 'Just tried this amazing new restaurant in downtown! 🍕 The pizza was incredible. Highly recommend for anyone looking for authentic Italian food.', 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800', 18, 4),
(5, 'Golden hour photography session at the beach today 📸 The lighting was absolutely perfect. Nature never fails to amaze me!', 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=800', 42, 8),
(6, 'Leading a product strategy workshop today. Excited to align the team on our Q2 roadmap! 💼 Collaboration is key to building great products.', NULL, 12, 2),
(7, 'Deployed a new microservice architecture today. The performance improvements are incredible! 🚀 #DevOps #Microservices', 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800', 27, 6),
(8, 'Just published a new blog post about creative writing techniques! ✍️ Link in bio. Would love to hear your thoughts on storytelling.', NULL, 19, 9),
(9, 'Startup life update: We just closed our seed round! 🎉 Grateful for all the support from our investors and team. Time to scale!', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', 56, 12),
(10, 'Working on a new logo design for a tech startup. The minimalist approach is really coming together! 🎨 #GraphicDesign', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800', 21, 4),
(1, 'Coffee and code - the perfect combination for a productive morning! ☕💻 What''s your favorite coding setup?', NULL, 8, 3),
(2, 'User research session completed! 📋 The insights we gathered will definitely shape our next design iteration. Users are the heart of great design.', NULL, 14, 5);

-- Insert follower relationships
INSERT INTO followers (follower_id, following_id) VALUES
(1, 2), (1, 3), (1, 5), (1, 8),
(2, 1), (2, 4), (2, 6), (2, 10),
(3, 1), (3, 7), (3, 9),
(4, 2), (4, 5), (4, 8), (4, 10),
(5, 1), (5, 2), (5, 4), (5, 6),
(6, 2), (6, 3), (6, 9),
(7, 1), (7, 3), (7, 9),
(8, 2), (8, 4), (8, 6), (8, 10),
(9, 1), (9, 3), (9, 7),
(10, 2), (10, 4), (10, 5), (10, 8);

-- Insert likes
INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (5, 1), (8, 1), (9, 1),
(1, 2), (4, 2), (6, 2), (10, 2), (3, 2), (5, 2), (7, 2),
(1, 3), (2, 3), (7, 3), (9, 3), (4, 3),
(2, 4), (5, 4), (8, 4), (10, 4),
(1, 5), (2, 5), (3, 5), (4, 5), (6, 5), (7, 5), (8, 5), (9, 5),
(2, 6), (3, 6), (9, 6),
(1, 7), (3, 7), (5, 7), (9, 7),
(2, 8), (4, 8), (6, 8), (10, 8),
(1, 9), (2, 9), (3, 9), (4, 9), (5, 9), (6, 9), (7, 9), (8, 9),
(2, 10), (4, 10), (5, 10), (8, 10);

-- Insert comments
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'This looks amazing! Can''t wait to try it out in my next project.'),
(3, 1, 'Great work! The API design looks really clean.'),
(5, 1, 'Love the documentation. Very thorough!'),
(1, 2, 'The color palette is beautiful! Earth tones are definitely trending.'),
(4, 2, 'This would work perfectly for our wellness app.'),
(6, 2, 'Have you considered accessibility contrast ratios?'),
(10, 2, 'As a designer, I absolutely love this approach!'),
(1, 3, 'Impressive accuracy! What algorithm did you use?'),
(2, 3, 'The data visualization looks great too.'),
(7, 3, 'Would love to collaborate on the deployment pipeline.'),
(9, 3, 'This could be perfect for our startup''s needs.'),
(2, 4, 'Adding this to my must-visit list!'),
(5, 4, 'The photos look delicious. Thanks for the recommendation!'),
(8, 4, 'I love discovering new restaurants through social media.'),
(1, 5, 'Stunning photography as always!'),
(2, 5, 'The composition is perfect. Great eye!'),
(3, 5, 'This makes me want to take up photography.'),
(4, 5, 'Beach sunsets are the best. Great capture!'),
(6, 5, 'The colors are absolutely gorgeous.'),
(7, 5, 'Professional quality work!'),
(8, 5, 'This would make a great print.'),
(9, 5, 'Nature photography at its finest.'),
(2, 6, 'Product strategy workshops are so valuable for alignment.'),
(3, 6, 'Hope the roadmap planning goes well!'),
(1, 7, 'Microservices are game-changers for scalability.'),
(3, 7, 'What tools did you use for orchestration?'),
(5, 7, 'The performance improvements sound impressive!'),
(9, 7, 'We''re considering a similar architecture.'),
(2, 8, 'Just read your blog post - excellent insights!'),
(4, 8, 'Your writing style is very engaging.'),
(6, 8, 'The storytelling techniques are really helpful.'),
(10, 8, 'Looking forward to your next post!'),
(1, 9, 'Congratulations on the funding! Well deserved.'),
(2, 9, 'Exciting times ahead for your startup!'),
(3, 9, 'The growth potential looks incredible.'),
(4, 9, 'Wishing you all the best with scaling!'),
(5, 9, 'Amazing achievement! Proud of your progress.'),
(6, 9, 'Can''t wait to see what you build next.'),
(7, 9, 'Startup success stories are so inspiring.'),
(8, 9, 'Your dedication has really paid off.'),
(2, 10, 'The minimalist approach is perfect for tech branding.'),
(4, 10, 'Clean and modern - exactly what startups need.'),
(5, 10, 'Your design aesthetic is always on point.'),
(8, 10, 'Would love to see the full brand identity.');

-- Insert conversations and messages
INSERT INTO conversations (user1_id, user2_id, updated_at) VALUES
(1, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 4, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(3, 5, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(4, 6, CURRENT_TIMESTAMP - INTERVAL '1 hour');

INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
(1, 2, 'Hey Jane! Loved your latest design work. The color palette is incredible!', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(2, 1, 'Thank you so much John! I was inspired by your component library actually.', CURRENT_TIMESTAMP - INTERVAL '2 hours' + INTERVAL '5 minutes'),
(1, 2, 'That''s awesome! Would love to collaborate on a project sometime.', CURRENT_TIMESTAMP - INTERVAL '2 hours' + INTERVAL '10 minutes'),
(2, 1, 'Definitely! I have some ideas for a design system that could use your components.', CURRENT_TIMESTAMP - INTERVAL '2 hours' + INTERVAL '15 minutes'),
(1, 3, 'Alex, your ML model results are impressive! 94% accuracy is fantastic.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 1, 'Thanks John! It took a lot of data preprocessing but worth it.', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes'),
(2, 4, 'Sarah, that restaurant recommendation was spot on! The pizza was amazing.', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(4, 2, 'So glad you enjoyed it! I''m always hunting for great food spots.', CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '10 minutes'),
(3, 5, 'Mike, your beach photography is stunning. What camera do you use?', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(5, 3, 'Thank you! I use a Canon EOS R5 with a 24-70mm lens. Perfect for golden hour shots.', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
(4, 6, 'Emma, how did the product workshop go? Would love to hear about your process.', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(6, 4, 'It went really well! We used design thinking methodology to align on priorities.', CURRENT_TIMESTAMP - INTERVAL '55 minutes');

-- Update conversations with last message IDs
UPDATE conversations SET last_message_id = (
    SELECT id FROM messages 
    WHERE (sender_id = conversations.user1_id AND receiver_id = conversations.user2_id) 
       OR (sender_id = conversations.user2_id AND receiver_id = conversations.user1_id)
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Insert AI chat sessions
INSERT INTO ai_chat_sessions (user_id, session_name, created_at, updated_at) VALUES
(1, 'React Development Help', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(2, 'Design System Planning', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(3, 'Machine Learning Advice', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(4, 'Marketing Strategy', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
(5, 'Photography Tips', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert AI chat messages
INSERT INTO ai_chat_messages (session_id, role, content, created_at) VALUES
(1, 'user', 'I need help optimizing my React components for better performance.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 'assistant', 'I''d be happy to help you optimize your React components! Here are some key strategies:\n\n1. **Use React.memo()** for functional components to prevent unnecessary re-renders\n2. **Implement useMemo()** for expensive calculations\n3. **Use useCallback()** for function references\n4. **Code splitting** with React.lazy() and Suspense\n\nWhat specific performance issues are you experiencing?', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 minutes'),
(1, 'user', 'My list component re-renders too often when the parent state changes.', CURRENT_TIMESTAMP - INTERVAL '1 hour' + INTERVAL '5 minutes'),
(1, 'assistant', 'That''s a common issue! Here''s how to fix it:\n\n```jsx\nconst ListComponent = React.memo(({ items, onItemClick }) => {\n  return (\n    <ul>\n      {items.map(item => (\n        <ListItem key={item.id} item={item} onClick={onItemClick} />\n      ))}\n    </ul>\n  );\n});\n```\n\nAlso, make sure to memoize the `onItemClick` function in the parent component using `useCallback`.', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(2, 'user', 'What are the best practices for creating a scalable design system?', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 'assistant', 'Great question! Here are the key principles for a scalable design system:\n\n**1. Atomic Design Methodology**\n- Atoms (buttons, inputs)\n- Molecules (search bar, card header)\n- Organisms (navigation, product grid)\n- Templates & Pages\n\n**2. Design Tokens**\n- Colors, typography, spacing, shadows\n- Platform-agnostic values\n- Single source of truth\n\n**3. Component Documentation**\n- Usage guidelines\n- Do''s and don''ts\n- Code examples\n\n**4. Governance**\n- Clear contribution process\n- Regular audits\n- Version control\n\nWhat platform are you building this for?', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '3 minutes'),
(2, 'user', 'We''re building for web and mobile. How do we ensure consistency across platforms?', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(2, 'assistant', 'Excellent! Cross-platform consistency is crucial. Here''s my recommended approach:\n\n**Design Tokens Strategy:**\n- Use tools like Style Dictionary or Theo\n- Define tokens in JSON/YAML format\n- Generate platform-specific outputs (CSS, iOS, Android)\n\n**Component Mapping:**\n- Create a component matrix showing web vs mobile equivalents\n- Define responsive breakpoints\n- Establish interaction patterns for each platform\n\n**Testing Strategy:**\n- Visual regression testing\n- Cross-platform design reviews\n- Regular design-dev sync meetings\n\nWould you like me to elaborate on any of these areas?', CURRENT_TIMESTAMP - INTERVAL '30 minutes' + INTERVAL '1 minute'),
(3, 'user', 'I''m working on a classification model but struggling with overfitting. Any suggestions?', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 'assistant', 'Overfitting is a common challenge! Here are proven techniques to address it:\n\n**Regularization Techniques:**\n- L1/L2 regularization\n- Dropout layers (for neural networks)\n- Early stopping\n\n**Data Strategies:**\n- Increase training data size\n- Data augmentation\n- Cross-validation\n\n**Model Complexity:**\n- Reduce model parameters\n- Feature selection\n- Ensemble methods\n\n**Validation:**\n- Use separate validation set\n- Monitor validation vs training loss\n- Learning curves analysis\n\nWhat type of model are you using and what''s your current validation accuracy?', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '5 minutes'),
(3, 'user', 'I''m using a Random Forest with 500 trees. Training accuracy is 98% but validation is only 75%.', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(3, 'assistant', 'That''s a clear case of overfitting! For Random Forest, try these specific solutions:\n\n**Hyperparameter Tuning:**\n- Reduce `n_estimators` from 500 to 100-200\n- Increase `min_samples_split` (try 10-20)\n- Increase `min_samples_leaf` (try 5-10)\n- Set `max_depth` to limit tree depth (try 10-15)\n\n**Feature Engineering:**\n- Remove highly correlated features\n- Use feature importance to select top features\n- Apply PCA if you have many features\n\n**Cross-Validation:**\n```python\nfrom sklearn.model_selection import GridSearchCV\n\nparam_grid = {\n    ''n_estimators'': [100, 200],\n    ''max_depth'': [10, 15, 20],\n    ''min_samples_split'': [10, 20]\n}\n```\n\nThis should help close the gap between training and validation accuracy!', CURRENT_TIMESTAMP - INTERVAL '2 hours' + INTERVAL '2 minutes');

-- Insert notifications
INSERT INTO notifications (user_id, from_user_id, type, content, created_at) VALUES
(1, 2, 'follow', 'started following you', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(1, 3, 'like', 'liked your post', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(2, 1, 'comment', 'commented on your post', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(3, 5, 'follow', 'started following you', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(4, 2, 'like', 'liked your post', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 1, 'comment', 'commented on your post', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
(6, 9, 'follow', 'started following you', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(7, 3, 'like', 'liked your post', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(8, 4, 'comment', 'commented on your post', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(9, 1, 'follow', 'started following you', CURRENT_TIMESTAMP - INTERVAL '6 hours');