import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import "./pages/styles/PublicPages.css";
import { usePublicCms } from "./cms/usePublicCms";
import { LoadingProvider } from "./context/LoadingProvider";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import PatentShowcasePage from "./pages/PatentShowcasePage";
import WorkShowcasePage from "./pages/WorkShowcasePage";
import AppLink from "./routing/AppLink";
import { matchPath, useCurrentPath } from "./routing/router";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));

const NotFoundPage = () => (
  <div className="public-page">
    <main className="public-shell">
      <h1 className="public-headline">
        Page <span>Not Found</span>
      </h1>
      <p className="public-lead">
        The requested route is not available. Return to the homepage.
      </p>
      <div className="showcase-actions">
        <AppLink href="/">Go Home</AppLink>
      </div>
    </main>
  </div>
);

const App = () => {
  const pathname = useCurrentPath();
  const { data, blogPosts, blogCategories, blogTags, loading, error } =
    usePublicCms();
  const blogPostMatch = matchPath(pathname, "/blog/:slug");
  const showCharacter =
    pathname === "/" &&
    data.settings.animationSettings.heroEnabled &&
    data.settings.sectionVisibility.landing;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (pathname === "/") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pathname]);

  let routeContent: JSX.Element;
  if (pathname === "/admin/login") {
    routeContent = <AdminLoginPage />;
  } else if (pathname === "/admin") {
    routeContent = <AdminPage />;
  } else if (loading && pathname !== "/admin" && pathname !== "/admin/login") {
    routeContent = (
      <div className="public-page">
        <main className="public-shell">
          <h1 className="public-headline">Loading CMS Data...</h1>
          {error ? <p className="public-lead">{error}</p> : null}
        </main>
      </div>
    );
  } else if (pathname === "/") {
    routeContent = (
      <Suspense>
        <MainContainer cmsData={data}>
          <Suspense>{showCharacter ? <CharacterModel /> : null}</Suspense>
        </MainContainer>
      </Suspense>
    );
  } else if (pathname === "/work-showcase") {
    routeContent = <WorkShowcasePage items={data.workItems} />;
  } else if (pathname === "/patent-showcase") {
    routeContent = <PatentShowcasePage items={data.patentItems} />;
  } else if (pathname === "/blog") {
    routeContent = (
      <BlogPage posts={blogPosts} categories={blogCategories} tags={blogTags} />
    );
  } else if (blogPostMatch.matched) {
    routeContent = (
      <BlogPostPage
        post={
          blogPosts.find((post) => post.slug === blogPostMatch.params.slug) ?? null
        }
        categories={blogCategories}
        tags={blogTags}
      />
    );
  } else {
    routeContent = <NotFoundPage />;
  }

  return (
    <LoadingProvider>
      <Suspense>{routeContent}</Suspense>
    </LoadingProvider>
  );
};

export default App;
