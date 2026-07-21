-- Enable Row Level Security (RLS) on critical tables
ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."post_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."connection_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Posts: Anyone can view, only authenticated users can insert, users can only update/delete their own posts
CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts" ON "public"."posts" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON "public"."posts" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON "public"."posts" FOR DELETE USING (auth.uid() = user_id);

-- Events: Anyone can view, authenticated users can insert, users can update/delete their own events
CREATE POLICY "Events are viewable by everyone" ON "public"."events" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert events" ON "public"."events" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own events" ON "public"."events" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON "public"."events" FOR DELETE USING (auth.uid() = user_id);

-- Comments: Viewable by everyone, insert by authenticated, delete/update by owner
CREATE POLICY "Comments are viewable by everyone" ON "public"."post_comments" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON "public"."post_comments" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON "public"."post_comments" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON "public"."post_comments" FOR DELETE USING (auth.uid() = user_id);

-- Connection Requests: Users can view requests they sent or received
CREATE POLICY "Users can view their connection requests" ON "public"."connection_requests" FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send connection requests" ON "public"."connection_requests" FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update connection requests they received" ON "public"."connection_requests" FOR UPDATE USING (auth.uid() = receiver_id);

-- Conversations and Messages (Though currently managed via backend, if accessed from frontend directly):
CREATE POLICY "Users can view their messages" ON "public"."messages" FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM "public"."conversation_participants" WHERE user_id = auth.uid()
  )
);

-- Notifications: Users can only see and update their own notifications
CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (auth.uid() = recipient_id);
