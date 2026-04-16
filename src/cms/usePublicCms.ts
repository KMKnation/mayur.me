import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CMS_CONTENT } from "./defaultContent";
import { fetchPublicBlogData, fetchPublicCmsData } from "./repository";
import { BlogCategory, BlogPost, BlogTag, PublicCmsData } from "./types";

interface UsePublicCmsResult {
  data: PublicCmsData;
  blogPosts: BlogPost[];
  blogCategories: BlogCategory[];
  blogTags: BlogTag[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePublicCms = (): UsePublicCmsResult => {
  const [data, setData] = useState<PublicCmsData>(DEFAULT_CMS_CONTENT);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [blogTags, setBlogTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cmsData, blogData] = await Promise.all([
        fetchPublicCmsData(),
        fetchPublicBlogData(),
      ]);
      setData(cmsData);
      setBlogPosts(blogData.posts);
      setBlogCategories(blogData.categories);
      setBlogTags(blogData.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CMS data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return useMemo(
    () => ({
      data,
      blogPosts,
      blogCategories,
      blogTags,
      loading,
      error,
      refresh,
    }),
    [data, blogPosts, blogCategories, blogTags, loading, error]
  );
};

