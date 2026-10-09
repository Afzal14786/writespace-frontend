import { useCallback, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import Footer from "@/components/layout/Footer";
import ProfileSidebar from "@/features/users/components/profile/ProfileSidebar";
import CreatePostEditor from "@/features/posts/components/CreatePostEditor";
import PostsFeed from "@/features/posts/components/PostsFeed";
import TrendingSidebar from "@/features/posts/components/TrendingSidebar";
import type { Post } from "@/features/posts/types/post.types";

export default function HomePage() {
  const { user } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handlePostCreated = useCallback((_post?: Post) => {
    setRefreshKey((current) => current + 1);
  }, []);

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  const handlePostUpdated = useCallback((_updatedPost: Post) => {
    setEditingPost(null);
    setRefreshKey((current) => current + 1);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50/40 dark:bg-slate-950">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <ProfileSidebar />
            </div>
          </aside>

          <section className="min-w-0 space-y-6 lg:col-span-6">
            <CreatePostEditor onPostCreated={handlePostCreated} />

            <PostsFeed
              currentUserId={user?.id}
              refreshKey={refreshKey}
              onEditPost={handleEditPost}
              emptyMessage="No published posts yet. Be the first to share something!"
            />
          </section>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <TrendingSidebar />
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {editingPost && (
        <CreatePostEditor
          key={editingPost.id}
          editPost={editingPost}
          onCloseEdit={handleCloseEdit}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}
