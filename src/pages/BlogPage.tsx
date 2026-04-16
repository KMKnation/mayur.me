import AppLink from "../routing/AppLink";
import { BlogCategory, BlogPost, BlogTag } from "../cms/types";
import "./styles/PublicPages.css";

interface BlogPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
}

const formatDate = (date: string | null) => {
  if (!date) return "Draft";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return date;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const BlogPage = ({ posts, categories, tags }: BlogPageProps) => {
  const categoriesById = new Map(categories.map((item) => [item.id, item]));
  const tagsById = new Map(tags.map((item) => [item.id, item]));

  return (
    <div className="public-page">
      <main className="public-shell">
        <div className="public-topbar">
          <div className="brand">MK Portfolio</div>
          <AppLink href="/">Back to Home</AppLink>
        </div>
        <h1 className="public-headline">
          Portfolio <span>Blog</span>
        </h1>
        <p className="public-lead">
          Insights on LLM systems, enterprise multi-agent execution, and
          real-world AI delivery patterns.
        </p>

        <section className="blog-grid">
          {posts.length ? (
            posts.map((post) => {
              const primaryCategory = post.categoryIds[0]
                ? categoriesById.get(post.categoryIds[0])?.name
                : "General";
              const displayTags = post.tagIds
                .map((tagId) => tagsById.get(tagId)?.name)
                .filter(Boolean)
                .slice(0, 2)
                .join(" · ");

              return (
                <article className="blog-card" key={post.id}>
                  <div className="blog-cover">
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt={post.title} />
                    ) : null}
                  </div>
                  <div className="blog-content">
                    <p className="blog-meta">
                      {primaryCategory} · {formatDate(post.publishedAt)}
                    </p>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    {displayTags ? (
                      <p className="blog-meta" style={{ marginTop: "8px" }}>
                        {displayTags}
                      </p>
                    ) : null}
                    <div className="showcase-actions">
                      <AppLink href={`/blog/${post.slug}`}>Read Post</AppLink>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <article className="blog-card">
              <div className="blog-content">
                <p className="blog-meta">No Posts Yet</p>
                <h3>Blog publishing is now CMS-ready.</h3>
                <p>Create and publish your first article from the Admin panel.</p>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
};

export default BlogPage;

