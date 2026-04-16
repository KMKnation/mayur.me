import { useEffect } from "react";
import AppLink from "../routing/AppLink";
import { BlogCategory, BlogPost, BlogTag } from "../cms/types";
import "./styles/PublicPages.css";

interface BlogPostPageProps {
  post: BlogPost | null;
  categories: BlogCategory[];
  tags: BlogTag[];
}

const formatDate = (date: string | null) => {
  if (!date) return "Draft";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return date;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};

const BlogPostPage = ({ post, categories, tags }: BlogPostPageProps) => {
  useEffect(() => {
    const previousTitle = document.title;
    const metaName = "description";
    const existingMeta = document.querySelector(
      `meta[name="${metaName}"]`
    ) as HTMLMetaElement | null;
    const previousDescription = existingMeta?.content ?? "";
    const description =
      post?.seoDescription || post?.excerpt || "Portfolio blog post";

    document.title = post?.seoTitle || post?.title || "Post Not Found";
    if (existingMeta) {
      existingMeta.content = description;
    } else {
      const createdMeta = document.createElement("meta");
      createdMeta.name = metaName;
      createdMeta.content = description;
      document.head.appendChild(createdMeta);
    }

    return () => {
      document.title = previousTitle;
      const meta = document.querySelector(
        `meta[name="${metaName}"]`
      ) as HTMLMetaElement | null;
      if (meta) {
        meta.content = previousDescription;
      }
    };
  }, [post]);

  if (!post) {
    return (
      <div className="public-page">
        <main className="public-shell">
          <div className="public-topbar">
            <div className="brand">MK Portfolio</div>
            <AppLink href="/blog">Back to Blog</AppLink>
          </div>
          <h1 className="public-headline">Post Not Found</h1>
          <p className="public-lead">
            The requested post is unavailable or not yet published.
          </p>
        </main>
      </div>
    );
  }

  const categoryNames = post.categoryIds
    .map((id) => categories.find((item) => item.id === id)?.name)
    .filter(Boolean)
    .join(" · ");
  const tagNames = post.tagIds
    .map((id) => tags.find((item) => item.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="public-page">
      <main className="public-shell">
        <div className="public-topbar">
          <div className="brand">MK Portfolio</div>
          <AppLink href="/blog">Back to Blog</AppLink>
        </div>
        <h1 className="public-headline">{post.title}</h1>
        <p className="public-lead">
          {categoryNames || "General"} · {formatDate(post.publishedAt)}
          {tagNames ? ` · ${tagNames}` : ""}
        </p>
        <article className="blog-detail">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "14px",
              }}
            />
          ) : null}
          <div
            className="blog-body"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml || "<p>No content.</p>" }}
          />
        </article>
      </main>
    </div>
  );
};

export default BlogPostPage;
