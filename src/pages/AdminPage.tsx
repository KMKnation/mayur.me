import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { clampAnimationSettings, parseMaybeNumber } from "../cms/animation";
import { DEFAULT_CMS_CONTENT, SUPER_ADMIN_EMAIL } from "../cms/defaultContent";
import {
  deleteBlogPost,
  deleteMediaAsset,
  fetchAdminBlogData,
  fetchAdminCmsData,
  fetchAdminInvites,
  fetchAdminUsers,
  fetchMediaAssets,
  fetchRevisions,
  inviteAdminUser,
  restoreRevision,
  saveAdminUser,
  saveBlogCategory,
  saveBlogPost,
  saveBlogTag,
  savePatentItems,
  saveSectionContent,
  saveSiteSettings,
  saveSocialLinks,
  saveTechItems,
  saveWorkItems,
  uploadMedia,
} from "../cms/repository";
import { isSupabaseConfigured } from "../cms/supabaseRest";
import { useAdminAuth } from "../cms/useAdminAuth";
import {
  AdminInvite,
  AdminUser,
  BlogCategory,
  BlogPost,
  BlogTag,
  ContentRevision,
  MediaAsset,
  PatentItem,
  PublicCmsData,
  SectionContentMap,
  SiteNavigationItem,
  TechItem,
  WorkItem,
} from "../cms/types";
import AppLink from "../routing/AppLink";
import { navigate } from "../routing/router";
import "./styles/Admin.css";

type AdminTab =
  | "site"
  | "sections"
  | "work"
  | "patents"
  | "tech"
  | "blog"
  | "media"
  | "animations"
  | "admins"
  | "revisions";

const ADMIN_TABS: Array<{ key: AdminTab; label: string }> = [
  { key: "site", label: "Site" },
  { key: "sections", label: "Sections" },
  { key: "work", label: "Work" },
  { key: "patents", label: "Patents" },
  { key: "tech", label: "Tech Stack" },
  { key: "blog", label: "Blog" },
  { key: "media", label: "Media" },
  { key: "animations", label: "Animations" },
  { key: "admins", label: "Admins" },
  { key: "revisions", label: "Revisions" },
];

const createLocalId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const datetimeLocalFromIso = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const isoFromDatetimeLocal = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  return date.toISOString();
};

const toggleListValue = (items: string[], value: string) =>
  items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];

const swapByIndex = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

const newDraftBlogPost = (): BlogPost => ({
  id: createLocalId("post"),
  title: "New Post",
  slug: "",
  excerpt: "",
  bodyHtml: "<p>Start writing...</p>",
  coverImageUrl: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  publishedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categoryIds: [],
  tagIds: [],
});

const AdminPage = () => {
  const auth = useAdminAuth();
  const [tab, setTab] = useState<AdminTab>("site");
  const [cmsData, setCmsData] = useState<PublicCmsData>(DEFAULT_CMS_CONTENT);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [blogTags, setBlogTags] = useState<BlogTag[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminInvites, setAdminInvites] = useState<AdminInvite[]>([]);
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadBucket, setUploadBucket] = useState("portfolio-media");
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const isSuperAdmin =
    (auth.role === "super_admin" ||
      auth.userEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) ??
    false;

  const selectedBlogPost = useMemo(
    () => blogPosts.find((post) => post.id === selectedBlogId) ?? null,
    [blogPosts, selectedBlogId]
  );

  const sectionVisibilityEntries = useMemo(
    () =>
      Object.keys(cmsData.settings.sectionVisibility).map((key) => ({
        key,
        value: cmsData.settings.sectionVisibility[key],
      })),
    [cmsData.settings.sectionVisibility]
  );

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getSessionContext = () => {
    if (!auth.session?.accessToken || !auth.userEmail) {
      throw new Error("Admin session unavailable. Please login again.");
    }
    return { token: auth.session.accessToken, editorEmail: auth.userEmail };
  };

  const loadAll = async () => {
    const token = auth.session?.accessToken;
    if (!token) return;
    setLoadingData(true);
    setError(null);
    try {
      const [cms, blogData, media, users, invites, revisionRows] =
        await Promise.all([
          fetchAdminCmsData(token),
          fetchAdminBlogData(token),
          fetchMediaAssets(token),
          fetchAdminUsers(token),
          fetchAdminInvites(token),
          fetchRevisions(token),
        ]);

      setCmsData(cms);
      setBlogPosts(blogData.posts);
      setBlogCategories(blogData.categories);
      setBlogTags(blogData.tags);
      setSelectedBlogId((current) =>
        current && blogData.posts.some((post) => post.id === current)
          ? current
          : blogData.posts[0]?.id ?? ""
      );
      setMediaAssets(media);
      setAdminUsers(users);
      setAdminInvites(invites);
      setRevisions(revisionRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CMS data.");
    } finally {
      setLoadingData(false);
    }
  };

  const runAction = async (
    action: (token: string, editorEmail: string) => Promise<void>,
    successMessage: string,
    shouldRefresh = true
  ) => {
    resetMessages();
    try {
      const { token, editorEmail } = getSessionContext();
      await action(token, editorEmail);
      setSuccess(successMessage);
      if (shouldRefresh) {
        setRefreshKey((current) => current + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    }
  };

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      navigate("/admin/login");
    }
  }, [auth.loading, auth.isAuthenticated]);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated || !auth.isAuthorized || !auth.session?.accessToken) {
      return;
    }
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    auth.loading,
    auth.isAuthenticated,
    auth.isAuthorized,
    auth.session?.accessToken,
    refreshKey,
  ]);

  const updateSettings = <K extends keyof PublicCmsData["settings"]>(
    key: K,
    value: PublicCmsData["settings"][K]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        [key]: value,
      },
    }));
  };

  const updateNavigationItem = (
    index: number,
    key: keyof SiteNavigationItem,
    value: SiteNavigationItem[keyof SiteNavigationItem]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        navigation: previous.settings.navigation.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item
        ),
      },
    }));
  };

  const updateSectionContent = <K extends keyof SectionContentMap>(
    key: K,
    value: SectionContentMap[K]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      sections: {
        ...previous.sections,
        [key]: value,
      },
    }));
  };

  const updateWorkItem = (
    id: string,
    key: keyof WorkItem,
    value: WorkItem[keyof WorkItem]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      workItems: previous.workItems.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updatePatentItem = (
    id: string,
    key: keyof PatentItem,
    value: PatentItem[keyof PatentItem]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      patentItems: previous.patentItems.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updateTechItem = (
    id: string,
    key: keyof TechItem,
    value: TechItem[keyof TechItem]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      techItems: previous.techItems.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updateSocialLink = (
    index: number,
    key: keyof PublicCmsData["socialLinks"][number],
    value: PublicCmsData["socialLinks"][number][keyof PublicCmsData["socialLinks"][number]]
  ) => {
    setCmsData((previous) => ({
      ...previous,
      socialLinks: previous.socialLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updateSelectedBlogPost = (partial: Partial<BlogPost>) => {
    setBlogPosts((previous) =>
      previous.map((post) =>
        post.id === selectedBlogId
          ? { ...post, ...partial, updatedAt: new Date().toISOString() }
          : post
      )
    );
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await runAction(
      async (token, editorEmail) => {
        await uploadMedia(file, uploadBucket, token, editorEmail);
      },
      "Media uploaded successfully."
    );
    setUploading(false);
    event.target.value = "";
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="admin-page">
        <main className="admin-shell">
          <div className="public-topbar">
            <div className="brand">MK Portfolio</div>
            <AppLink href="/">Back to Home</AppLink>
          </div>
          <div className="admin-panel">
            <h2>Supabase Configuration Required</h2>
            <p className="admin-note">
              Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to use the
              admin CMS.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (auth.loading || loadingData) {
    return (
      <div className="admin-page">
        <main className="admin-shell">
          <div className="admin-panel">
            <h2>Loading Admin CMS...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="admin-page">
        <main className="admin-shell">
          <div className="admin-panel">
            <h2>Authentication Required</h2>
            <p className="admin-note">Please sign in with Google to continue.</p>
            <button
              className="admin-btn"
              type="button"
              onClick={auth.signInWithGoogle}
            >
              Continue with Google
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthorized) {
    return (
      <div className="admin-page">
        <main className="admin-shell">
          <div className="admin-panel">
            <h2>Unauthorized</h2>
            <p className="admin-note">
              Your account is signed in but not listed as an active admin.
            </p>
            <div className="admin-row">
              <button className="admin-btn" type="button" onClick={auth.signOut}>
                Sign Out
              </button>
              <AppLink href="/admin/login" className="admin-mini-btn">
                Back to Login
              </AppLink>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <main className="admin-shell">
        <div className="admin-header">
          <h1>
            Admin <span>CMS</span>
          </h1>
          <div className="actions">
            <span className="admin-pill">
              {auth.userEmail} · {auth.role ?? "admin"}
            </span>
            <button
              className="admin-mini-btn"
              type="button"
              onClick={() => void auth.refresh()}
            >
              Refresh Session
            </button>
            <button className="admin-mini-btn" type="button" onClick={auth.signOut}>
              Sign Out
            </button>
            <AppLink href="/" className="admin-mini-btn">
              Home
            </AppLink>
          </div>
        </div>

        <div className="admin-tabs">
          {ADMIN_TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {success ? <p className="admin-success">{success}</p> : null}

        {tab === "site" ? (
          <section className="admin-panel">
            <h2>Global Settings and Navigation</h2>
            <div className="admin-grid">
              <div className="admin-field">
                <label>Site Name</label>
                <input
                  className="admin-input"
                  value={cmsData.settings.siteName}
                  onChange={(event) =>
                    updateSettings("siteName", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label>Hero Initials</label>
                <input
                  className="admin-input"
                  value={cmsData.settings.heroInitials}
                  onChange={(event) =>
                    updateSettings("heroInitials", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label>LinkedIn Handle Label</label>
                <input
                  className="admin-input"
                  value={cmsData.settings.linkedinHandle}
                  onChange={(event) =>
                    updateSettings("linkedinHandle", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label>Profile URL</label>
                <input
                  className="admin-input"
                  value={cmsData.settings.profileUrl}
                  onChange={(event) =>
                    updateSettings("profileUrl", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label>Resume Button Label</label>
                <input
                  className="admin-input"
                  value={cmsData.settings.resumeLabel}
                  onChange={(event) =>
                    updateSettings("resumeLabel", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label>Resume URL</label>
                <input
                  className="admin-input"
                  value={cmsData.settings.resumeUrl}
                  onChange={(event) =>
                    updateSettings("resumeUrl", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="admin-editor">
              <h2>Navigation Items</h2>
              <div className="admin-card-list">
                {cmsData.settings.navigation.map((item, index) => (
                  <article key={`${item.label}-${index}`} className="admin-card">
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">Nav Item #{index + 1}</h3>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            updateSettings(
                              "navigation",
                              swapByIndex(cmsData.settings.navigation, index, index - 1)
                            )
                          }
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            updateSettings(
                              "navigation",
                              swapByIndex(cmsData.settings.navigation, index, index + 1)
                            )
                          }
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            updateSettings(
                              "navigation",
                              cmsData.settings.navigation.filter(
                                (_entry, entryIndex) => entryIndex !== index
                              )
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-field">
                        <label>Label</label>
                        <input
                          className="admin-input"
                          value={item.label}
                          onChange={(event) =>
                            updateNavigationItem(index, "label", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Href</label>
                        <input
                          className="admin-input"
                          value={item.href}
                          onChange={(event) =>
                            updateNavigationItem(index, "href", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Type</label>
                        <select
                          className="admin-select"
                          value={item.type}
                          onChange={(event) =>
                            updateNavigationItem(
                              index,
                              "type",
                              event.target.value as SiteNavigationItem["type"]
                            )
                          }
                        >
                          <option value="section">Section</option>
                          <option value="route">Route</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Visible</label>
                        <select
                          className="admin-select"
                          value={item.isVisible ? "true" : "false"}
                          onChange={(event) =>
                            updateNavigationItem(
                              index,
                              "isVisible",
                              event.target.value === "true"
                            )
                          }
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() =>
                  updateSettings("navigation", [
                    ...cmsData.settings.navigation,
                    {
                      label: "NEW ITEM",
                      href: "/",
                      type: "route",
                      isVisible: true,
                    },
                  ])
                }
              >
                Add Navigation Item
              </button>
            </div>

            <div className="admin-editor">
              <h2>Section Visibility</h2>
              <div className="admin-row">
                {sectionVisibilityEntries.map((entry) => (
                  <label key={entry.key} className="admin-pill">
                    <input
                      type="checkbox"
                      checked={entry.value}
                      onChange={(event) =>
                        updateSettings("sectionVisibility", {
                          ...cmsData.settings.sectionVisibility,
                          [entry.key]: event.target.checked,
                        })
                      }
                    />{" "}
                    {entry.key}
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-row">
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  void runAction(
                    async (token, editorEmail) => {
                      await saveSiteSettings(
                        {
                          ...cmsData.settings,
                          animationSettings: clampAnimationSettings(
                            cmsData.settings.animationSettings
                          ),
                        },
                        token,
                        editorEmail
                      );
                    },
                    "Site settings saved."
                  )
                }
              >
                Save Site Settings
              </button>
            </div>
          </section>
        ) : null}

        {tab === "sections" ? (
          <section className="admin-panel">
            <h2>Homepage Section Editors</h2>
            <div className="admin-card-list">
              <article className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Hero Section</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        (token, editorEmail) =>
                          saveSectionContent(
                            "hero",
                            cmsData.sections.hero,
                            token,
                            editorEmail
                          ),
                        "Hero section saved."
                      )
                    }
                  >
                    Save Hero
                  </button>
                </div>
                <div className="admin-grid">
                  {(
                    [
                      "greeting",
                      "firstName",
                      "lastName",
                      "rolePrefix",
                      "rolePrimary",
                      "roleSecondary",
                      "taglinePrimary",
                      "taglineSecondary",
                    ] as const
                  ).map((field) => (
                    <div className="admin-field" key={field}>
                      <label>{field}</label>
                      <input
                        className="admin-input"
                        value={cmsData.sections.hero[field]}
                        onChange={(event) =>
                          updateSectionContent("hero", {
                            ...cmsData.sections.hero,
                            [field]: event.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">About Section</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        (token, editorEmail) =>
                          saveSectionContent(
                            "about",
                            cmsData.sections.about,
                            token,
                            editorEmail
                          ),
                        "About section saved."
                      )
                    }
                  >
                    Save About
                  </button>
                </div>
                <div className="admin-grid">
                  <div className="admin-field">
                    <label>Title</label>
                    <input
                      className="admin-input"
                      value={cmsData.sections.about.title}
                      onChange={(event) =>
                        updateSectionContent("about", {
                          ...cmsData.sections.about,
                          title: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Body</label>
                    <textarea
                      className="admin-textarea"
                      value={cmsData.sections.about.body}
                      onChange={(event) =>
                        updateSectionContent("about", {
                          ...cmsData.sections.about,
                          body: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </article>

              <article className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">What I Do Section</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        (token, editorEmail) =>
                          saveSectionContent(
                            "whatIDo",
                            cmsData.sections.whatIDo,
                            token,
                            editorEmail
                          ),
                        "What I Do section saved."
                      )
                    }
                  >
                    Save What I Do
                  </button>
                </div>
                <div className="admin-grid">
                  <div className="admin-field">
                    <label>Title Primary</label>
                    <input
                      className="admin-input"
                      value={cmsData.sections.whatIDo.titlePrimary}
                      onChange={(event) =>
                        updateSectionContent("whatIDo", {
                          ...cmsData.sections.whatIDo,
                          titlePrimary: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Title Secondary</label>
                    <input
                      className="admin-input"
                      value={cmsData.sections.whatIDo.titleSecondary}
                      onChange={(event) =>
                        updateSectionContent("whatIDo", {
                          ...cmsData.sections.whatIDo,
                          titleSecondary: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="admin-card-list">
                  {cmsData.sections.whatIDo.cards.map((card, index) => (
                    <article className="admin-card" key={`${card.title}-${index}`}>
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">Card #{index + 1}</h3>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            updateSectionContent("whatIDo", {
                              ...cmsData.sections.whatIDo,
                              cards: cmsData.sections.whatIDo.cards.filter(
                                (_item, itemIndex) => itemIndex !== index
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="admin-grid">
                        <div className="admin-field">
                          <label>Title</label>
                          <input
                            className="admin-input"
                            value={card.title}
                            onChange={(event) =>
                              updateSectionContent("whatIDo", {
                                ...cmsData.sections.whatIDo,
                                cards: cmsData.sections.whatIDo.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, title: event.target.value }
                                      : item
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Subtitle</label>
                          <input
                            className="admin-input"
                            value={card.subtitle}
                            onChange={(event) =>
                              updateSectionContent("whatIDo", {
                                ...cmsData.sections.whatIDo,
                                cards: cmsData.sections.whatIDo.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, subtitle: event.target.value }
                                      : item
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Description</label>
                          <textarea
                            className="admin-textarea"
                            value={card.description}
                            onChange={(event) =>
                              updateSectionContent("whatIDo", {
                                ...cmsData.sections.whatIDo,
                                cards: cmsData.sections.whatIDo.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, description: event.target.value }
                                      : item
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Skills (comma separated)</label>
                          <input
                            className="admin-input"
                            value={card.skills.join(", ")}
                            onChange={(event) =>
                              updateSectionContent("whatIDo", {
                                ...cmsData.sections.whatIDo,
                                cards: cmsData.sections.whatIDo.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          skills: event.target.value
                                            .split(",")
                                            .map((skill) => skill.trim())
                                            .filter(Boolean),
                                        }
                                      : item
                                ),
                              })
                            }
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  className="admin-mini-btn"
                  onClick={() =>
                    updateSectionContent("whatIDo", {
                      ...cmsData.sections.whatIDo,
                      cards: [
                        ...cmsData.sections.whatIDo.cards,
                        {
                          title: "NEW CARD",
                          subtitle: "Subtitle",
                          description: "Description",
                          skills: [],
                        },
                      ],
                    })
                  }
                >
                  Add What-I-Do Card
                </button>
              </article>

              <article className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Career Section</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        (token, editorEmail) =>
                          saveSectionContent(
                            "career",
                            cmsData.sections.career,
                            token,
                            editorEmail
                          ),
                        "Career section saved."
                      )
                    }
                  >
                    Save Career
                  </button>
                </div>
                <div className="admin-grid">
                  <div className="admin-field">
                    <label>Title</label>
                    <input
                      className="admin-input"
                      value={cmsData.sections.career.title}
                      onChange={(event) =>
                        updateSectionContent("career", {
                          ...cmsData.sections.career,
                          title: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Highlight</label>
                    <input
                      className="admin-input"
                      value={cmsData.sections.career.highlight}
                      onChange={(event) =>
                        updateSectionContent("career", {
                          ...cmsData.sections.career,
                          highlight: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="admin-card-list">
                  {cmsData.sections.career.items.map((item, index) => (
                    <article className="admin-card" key={`${item.role}-${index}`}>
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">Career Item #{index + 1}</h3>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            updateSectionContent("career", {
                              ...cmsData.sections.career,
                              items: cmsData.sections.career.items.filter(
                                (_entry, entryIndex) => entryIndex !== index
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="admin-grid">
                        <div className="admin-field">
                          <label>Role</label>
                          <input
                            className="admin-input"
                            value={item.role}
                            onChange={(event) =>
                              updateSectionContent("career", {
                                ...cmsData.sections.career,
                                items: cmsData.sections.career.items.map(
                                  (entry, entryIndex) =>
                                    entryIndex === index
                                      ? { ...entry, role: event.target.value }
                                      : entry
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Company</label>
                          <input
                            className="admin-input"
                            value={item.company}
                            onChange={(event) =>
                              updateSectionContent("career", {
                                ...cmsData.sections.career,
                                items: cmsData.sections.career.items.map(
                                  (entry, entryIndex) =>
                                    entryIndex === index
                                      ? { ...entry, company: event.target.value }
                                      : entry
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Duration</label>
                          <input
                            className="admin-input"
                            value={item.duration}
                            onChange={(event) =>
                              updateSectionContent("career", {
                                ...cmsData.sections.career,
                                items: cmsData.sections.career.items.map(
                                  (entry, entryIndex) =>
                                    entryIndex === index
                                      ? { ...entry, duration: event.target.value }
                                      : entry
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Description</label>
                          <textarea
                            className="admin-textarea"
                            value={item.description}
                            onChange={(event) =>
                              updateSectionContent("career", {
                                ...cmsData.sections.career,
                                items: cmsData.sections.career.items.map(
                                  (entry, entryIndex) =>
                                    entryIndex === index
                                      ? { ...entry, description: event.target.value }
                                      : entry
                                ),
                              })
                            }
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  className="admin-mini-btn"
                  onClick={() =>
                    updateSectionContent("career", {
                      ...cmsData.sections.career,
                      items: [
                        ...cmsData.sections.career.items,
                        {
                          role: "Role",
                          company: "Company",
                          duration: "Year",
                          description: "Description",
                        },
                      ],
                    })
                  }
                >
                  Add Career Item
                </button>
              </article>

              <article className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Contact Section</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        (token, editorEmail) =>
                          saveSectionContent(
                            "contact",
                            cmsData.sections.contact,
                            token,
                            editorEmail
                          ),
                        "Contact section saved."
                      )
                    }
                  >
                    Save Contact
                  </button>
                </div>
                <div className="admin-grid">
                  {(
                    [
                      "title",
                      "connectTitle",
                      "educationTitle",
                      "socialTitle",
                      "footerTitle",
                      "footerHighlight",
                      "copyrightText",
                    ] as const
                  ).map((field) => (
                    <div className="admin-field" key={field}>
                      <label>{field}</label>
                      <input
                        className="admin-input"
                        value={cmsData.sections.contact[field]}
                        onChange={(event) =>
                          updateSectionContent("contact", {
                            ...cmsData.sections.contact,
                            [field]: event.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className="admin-field">
                    <label>Education Lines (one per line)</label>
                    <textarea
                      className="admin-textarea"
                      value={cmsData.sections.contact.educationLines.join("\n")}
                      onChange={(event) =>
                        updateSectionContent("contact", {
                          ...cmsData.sections.contact,
                          educationLines: event.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Connect Links (`label|url` per line)</label>
                    <textarea
                      className="admin-textarea"
                      value={cmsData.sections.contact.connectLinks
                        .map((item) => `${item.label}|${item.href}`)
                        .join("\n")}
                      onChange={(event) =>
                        updateSectionContent("contact", {
                          ...cmsData.sections.contact,
                          connectLinks: event.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line) => {
                              const [label, href] = line.split("|");
                              return {
                                label: (label ?? "").trim(),
                                href: (href ?? "").trim(),
                              };
                            })
                            .filter((item) => item.label && item.href),
                        })
                      }
                    />
                  </div>
                </div>
              </article>

              <article className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Social Links</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        (token, editorEmail) =>
                          saveSocialLinks(cmsData.socialLinks, token, editorEmail),
                        "Social links saved."
                      )
                    }
                  >
                    Save Social Links
                  </button>
                </div>
                <div className="admin-card-list">
                  {cmsData.socialLinks.map((item, index) => (
                    <article className="admin-card" key={item.id}>
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">{item.label}</h3>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              socialLinks: previous.socialLinks.filter(
                                (_entry, entryIndex) => entryIndex !== index
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="admin-grid">
                        <div className="admin-field">
                          <label>Label</label>
                          <input
                            className="admin-input"
                            value={item.label}
                            onChange={(event) =>
                              updateSocialLink(index, "label", event.target.value)
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>URL</label>
                          <input
                            className="admin-input"
                            value={item.url}
                            onChange={(event) =>
                              updateSocialLink(index, "url", event.target.value)
                            }
                          />
                        </div>
                        <div className="admin-field">
                          <label>Platform</label>
                          <select
                            className="admin-select"
                            value={item.platform}
                            onChange={(event) =>
                              updateSocialLink(
                                index,
                                "platform",
                                event.target.value as PublicCmsData["socialLinks"][number]["platform"]
                              )
                            }
                          >
                            <option value="github">github</option>
                            <option value="linkedin">linkedin</option>
                            <option value="email">email</option>
                            <option value="doc">doc</option>
                          </select>
                        </div>
                        <div className="admin-field">
                          <label>Visible</label>
                          <select
                            className="admin-select"
                            value={item.isVisible ? "true" : "false"}
                            onChange={(event) =>
                              updateSocialLink(
                                index,
                                "isVisible",
                                event.target.value === "true"
                              )
                            }
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  className="admin-mini-btn"
                  onClick={() =>
                    setCmsData((previous) => ({
                      ...previous,
                      socialLinks: [
                        ...previous.socialLinks,
                        {
                          id: createLocalId("social"),
                          label: "New Link",
                          url: "https://",
                          platform: "doc",
                          isVisible: true,
                        },
                      ],
                    }))
                  }
                >
                  Add Social Link
                </button>
              </article>
            </div>
          </section>
        ) : null}

        {tab === "work" ? (
          <section className="admin-panel">
            <h2>Work Manager</h2>
            <p className="admin-note">
              Manage all work tiles including display order, visibility, view-more
              tile behavior, CTA links, and animation presets.
            </p>
            <div className="admin-card-list">
              {cmsData.workItems
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => (
                  <article className="admin-card" key={item.id}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">
                        #{item.displayOrder} · {item.title}
                      </h3>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              workItems: swapByIndex(
                                previous.workItems,
                                previous.workItems.findIndex(
                                  (entry) => entry.id === item.id
                                ),
                                previous.workItems.findIndex(
                                  (entry) => entry.id === item.id
                                ) - 1
                              ).map((entry, entryIndex) => ({
                                ...entry,
                                displayOrder: entryIndex + 1,
                              })),
                            }))
                          }
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              workItems: swapByIndex(
                                previous.workItems,
                                previous.workItems.findIndex(
                                  (entry) => entry.id === item.id
                                ),
                                previous.workItems.findIndex(
                                  (entry) => entry.id === item.id
                                ) + 1
                              ).map((entry, entryIndex) => ({
                                ...entry,
                                displayOrder: entryIndex + 1,
                              })),
                            }))
                          }
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              workItems: previous.workItems
                                .filter((entry) => entry.id !== item.id)
                                .map((entry, entryIndex) => ({
                                  ...entry,
                                  displayOrder: entryIndex + 1,
                                })),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-field">
                        <label>Title</label>
                        <input
                          className="admin-input"
                          value={item.title}
                          onChange={(event) =>
                            updateWorkItem(item.id, "title", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Category</label>
                        <input
                          className="admin-input"
                          value={item.category}
                          onChange={(event) =>
                            updateWorkItem(item.id, "category", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Tools</label>
                        <textarea
                          className="admin-textarea"
                          value={item.tools}
                          onChange={(event) =>
                            updateWorkItem(item.id, "tools", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Link</label>
                        <input
                          className="admin-input"
                          value={item.link}
                          onChange={(event) =>
                            updateWorkItem(item.id, "link", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Animation Preset</label>
                        <input
                          className="admin-input"
                          value={item.animationPreset}
                          onChange={(event) =>
                            updateWorkItem(
                              item.id,
                              "animationPreset",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Visible</label>
                        <select
                          className="admin-select"
                          value={item.isVisible ? "true" : "false"}
                          onChange={(event) =>
                            updateWorkItem(
                              item.id,
                              "isVisible",
                              event.target.value === "true"
                            )
                          }
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>View More Tile</label>
                        <select
                          className="admin-select"
                          value={item.isViewMoreTile ? "true" : "false"}
                          onChange={(event) =>
                            updateWorkItem(
                              item.id,
                              "isViewMoreTile",
                              event.target.value === "true"
                            )
                          }
                        >
                          <option value="false">False</option>
                          <option value="true">True</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Display Order</label>
                        <input
                          className="admin-input"
                          value={item.displayOrder}
                          onChange={(event) =>
                            updateWorkItem(
                              item.id,
                              "displayOrder",
                              parseMaybeNumber(event.target.value, item.displayOrder)
                            )
                          }
                        />
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            <div className="admin-row">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() =>
                  setCmsData((previous) => ({
                    ...previous,
                    workItems: [
                      ...previous.workItems,
                      {
                        id: createLocalId("work"),
                        title: "New Work Item",
                        category: "Category",
                        tools: "Tools",
                        link: "/work-showcase",
                        isVisible: true,
                        displayOrder: previous.workItems.length + 1,
                        isViewMoreTile: false,
                        animationPreset: "default",
                      },
                    ],
                  }))
                }
              >
                Add Work Item
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  void runAction(
                    (token, editorEmail) =>
                      saveWorkItems(cmsData.workItems, token, editorEmail),
                    "Work items saved."
                  )
                }
              >
                Save Work Items
              </button>
            </div>
          </section>
        ) : null}

        {tab === "patents" ? (
          <section className="admin-panel">
            <h2>Patent Manager</h2>
            <p className="admin-note">
              Manage patent cards, visibility, view-more tile routing, and
              animation preset metadata.
            </p>
            <div className="admin-card-list">
              {cmsData.patentItems
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => (
                  <article className="admin-card" key={item.id}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">
                        #{item.displayOrder} · {item.title}
                      </h3>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              patentItems: swapByIndex(
                                previous.patentItems,
                                previous.patentItems.findIndex(
                                  (entry) => entry.id === item.id
                                ),
                                previous.patentItems.findIndex(
                                  (entry) => entry.id === item.id
                                ) - 1
                              ).map((entry, entryIndex) => ({
                                ...entry,
                                displayOrder: entryIndex + 1,
                              })),
                            }))
                          }
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              patentItems: swapByIndex(
                                previous.patentItems,
                                previous.patentItems.findIndex(
                                  (entry) => entry.id === item.id
                                ),
                                previous.patentItems.findIndex(
                                  (entry) => entry.id === item.id
                                ) + 1
                              ).map((entry, entryIndex) => ({
                                ...entry,
                                displayOrder: entryIndex + 1,
                              })),
                            }))
                          }
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              patentItems: previous.patentItems
                                .filter((entry) => entry.id !== item.id)
                                .map((entry, entryIndex) => ({
                                  ...entry,
                                  displayOrder: entryIndex + 1,
                                })),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-field">
                        <label>Title</label>
                        <input
                          className="admin-input"
                          value={item.title}
                          onChange={(event) =>
                            updatePatentItem(item.id, "title", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Type</label>
                        <input
                          className="admin-input"
                          value={item.type}
                          onChange={(event) =>
                            updatePatentItem(item.id, "type", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Summary</label>
                        <textarea
                          className="admin-textarea"
                          value={item.summary}
                          onChange={(event) =>
                            updatePatentItem(item.id, "summary", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Meta</label>
                        <input
                          className="admin-input"
                          value={item.meta}
                          onChange={(event) =>
                            updatePatentItem(item.id, "meta", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Link</label>
                        <input
                          className="admin-input"
                          value={item.link}
                          onChange={(event) =>
                            updatePatentItem(item.id, "link", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Animation Preset</label>
                        <input
                          className="admin-input"
                          value={item.animationPreset}
                          onChange={(event) =>
                            updatePatentItem(
                              item.id,
                              "animationPreset",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Visible</label>
                        <select
                          className="admin-select"
                          value={item.isVisible ? "true" : "false"}
                          onChange={(event) =>
                            updatePatentItem(
                              item.id,
                              "isVisible",
                              event.target.value === "true"
                            )
                          }
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>View More Tile</label>
                        <select
                          className="admin-select"
                          value={item.isViewMoreTile ? "true" : "false"}
                          onChange={(event) =>
                            updatePatentItem(
                              item.id,
                              "isViewMoreTile",
                              event.target.value === "true"
                            )
                          }
                        >
                          <option value="false">False</option>
                          <option value="true">True</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Display Order</label>
                        <input
                          className="admin-input"
                          value={item.displayOrder}
                          onChange={(event) =>
                            updatePatentItem(
                              item.id,
                              "displayOrder",
                              parseMaybeNumber(event.target.value, item.displayOrder)
                            )
                          }
                        />
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            <div className="admin-row">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() =>
                  setCmsData((previous) => ({
                    ...previous,
                    patentItems: [
                      ...previous.patentItems,
                      {
                        id: createLocalId("patent"),
                        title: "New Patent Entry",
                        type: "Type",
                        summary: "Summary",
                        meta: "Meta",
                        link: "/patent-showcase",
                        isVisible: true,
                        displayOrder: previous.patentItems.length + 1,
                        isViewMoreTile: false,
                        animationPreset: "default",
                      },
                    ],
                  }))
                }
              >
                Add Patent Item
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  void runAction(
                    (token, editorEmail) =>
                      savePatentItems(cmsData.patentItems, token, editorEmail),
                    "Patent items saved."
                  )
                }
              >
                Save Patent Items
              </button>
            </div>
          </section>
        ) : null}

        {tab === "tech" ? (
          <section className="admin-panel">
            <h2>Tech Stack Manager</h2>
            <div className="admin-card-list">
              {cmsData.techItems
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item, index) => (
                  <article className="admin-card" key={item.id}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">Tech #{index + 1}</h3>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            setCmsData((previous) => ({
                              ...previous,
                              techItems: previous.techItems.filter(
                                (entry) => entry.id !== item.id
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-field">
                        <label>Label</label>
                        <input
                          className="admin-input"
                          value={item.label}
                          onChange={(event) =>
                            updateTechItem(item.id, "label", event.target.value)
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Display Order</label>
                        <input
                          className="admin-input"
                          value={item.displayOrder}
                          onChange={(event) =>
                            updateTechItem(
                              item.id,
                              "displayOrder",
                              parseMaybeNumber(event.target.value, item.displayOrder)
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Visible</label>
                        <select
                          className="admin-select"
                          value={item.isVisible ? "true" : "false"}
                          onChange={(event) =>
                            updateTechItem(
                              item.id,
                              "isVisible",
                              event.target.value === "true"
                            )
                          }
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            <div className="admin-row">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() =>
                  setCmsData((previous) => ({
                    ...previous,
                    techItems: [
                      ...previous.techItems,
                      {
                        id: createLocalId("tech"),
                        label: "New Tech",
                        isVisible: true,
                        displayOrder: previous.techItems.length + 1,
                      },
                    ],
                  }))
                }
              >
                Add Tech Item
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  void runAction(
                    (token, editorEmail) =>
                      saveTechItems(cmsData.techItems, token, editorEmail),
                    "Tech stack saved."
                  )
                }
              >
                Save Tech Stack
              </button>
            </div>
          </section>
        ) : null}

        {tab === "blog" ? (
          <section className="admin-panel">
            <h2>Blog Manager</h2>
            <div className="admin-grid">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Posts</h3>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() => {
                      const draft = newDraftBlogPost();
                      setBlogPosts((previous) => [draft, ...previous]);
                      setSelectedBlogId(draft.id);
                    }}
                  >
                    New Draft
                  </button>
                </div>
                <div className="admin-card-list">
                  {blogPosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      className="admin-card"
                      onClick={() => setSelectedBlogId(post.id)}
                      style={{
                        textAlign: "left",
                        borderColor:
                          selectedBlogId === post.id ? "#5eead4" : "#2b3a55",
                      }}
                    >
                      <p className="admin-note">{post.status.toUpperCase()}</p>
                      <h3 className="admin-card-title">{post.title}</h3>
                      <p className="admin-note">/{post.slug || "no-slug"}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                {selectedBlogPost ? (
                  <>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">Post Editor</h3>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            void runAction(
                              (token, editorEmail) =>
                                saveBlogPost(
                                  {
                                    ...selectedBlogPost,
                                    slug:
                                      selectedBlogPost.slug ||
                                      slugify(selectedBlogPost.title),
                                  },
                                  token,
                                  editorEmail
                                ),
                              "Blog post saved."
                            )
                          }
                        >
                          Save Post
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            void runAction(
                              async (token) => {
                                await deleteBlogPost(selectedBlogPost.id, token);
                                setBlogPosts((previous) =>
                                  previous.filter(
                                    (post) => post.id !== selectedBlogPost.id
                                  )
                                );
                                setSelectedBlogId("");
                              },
                              "Blog post deleted.",
                              false
                            )
                          }
                        >
                          Delete Post
                        </button>
                      </div>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-field">
                        <label>Title</label>
                        <input
                          className="admin-input"
                          value={selectedBlogPost.title}
                          onChange={(event) =>
                            updateSelectedBlogPost({
                              title: event.target.value,
                              slug:
                                selectedBlogPost.slug ||
                                slugify(event.target.value || "post"),
                            })
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Slug</label>
                        <input
                          className="admin-input"
                          value={selectedBlogPost.slug}
                          onChange={(event) =>
                            updateSelectedBlogPost({
                              slug: slugify(event.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Status</label>
                        <select
                          className="admin-select"
                          value={selectedBlogPost.status}
                          onChange={(event) =>
                            updateSelectedBlogPost({
                              status: event.target.value as BlogPost["status"],
                              publishedAt:
                                event.target.value === "published"
                                  ? selectedBlogPost.publishedAt ??
                                    new Date().toISOString()
                                  : null,
                            })
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Published At</label>
                        <input
                          className="admin-input"
                          type="datetime-local"
                          value={datetimeLocalFromIso(selectedBlogPost.publishedAt)}
                          onChange={(event) =>
                            updateSelectedBlogPost({
                              publishedAt: isoFromDatetimeLocal(event.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Excerpt</label>
                        <textarea
                          className="admin-textarea"
                          value={selectedBlogPost.excerpt}
                          onChange={(event) =>
                            updateSelectedBlogPost({ excerpt: event.target.value })
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Cover Image URL</label>
                        <input
                          className="admin-input"
                          value={selectedBlogPost.coverImageUrl}
                          onChange={(event) =>
                            updateSelectedBlogPost({
                              coverImageUrl: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>SEO Title</label>
                        <input
                          className="admin-input"
                          value={selectedBlogPost.seoTitle}
                          onChange={(event) =>
                            updateSelectedBlogPost({ seoTitle: event.target.value })
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>SEO Description</label>
                        <textarea
                          className="admin-textarea"
                          value={selectedBlogPost.seoDescription}
                          onChange={(event) =>
                            updateSelectedBlogPost({
                              seoDescription: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label>Body HTML</label>
                      <textarea
                        className="admin-textarea"
                        value={selectedBlogPost.bodyHtml}
                        onChange={(event) =>
                          updateSelectedBlogPost({ bodyHtml: event.target.value })
                        }
                      />
                    </div>
                    <div className="admin-row" style={{ marginTop: "10px" }}>
                      <div className="admin-field" style={{ flex: "1 1 280px" }}>
                        <label>Categories</label>
                        <div className="admin-row">
                          {blogCategories.map((category) => (
                            <label key={category.id} className="admin-pill">
                              <input
                                type="checkbox"
                                checked={selectedBlogPost.categoryIds.includes(
                                  category.id
                                )}
                                onChange={() =>
                                  updateSelectedBlogPost({
                                    categoryIds: toggleListValue(
                                      selectedBlogPost.categoryIds,
                                      category.id
                                    ),
                                  })
                                }
                              />{" "}
                              {category.name}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="admin-field" style={{ flex: "1 1 280px" }}>
                        <label>Tags</label>
                        <div className="admin-row">
                          {blogTags.map((tag) => (
                            <label key={tag.id} className="admin-pill">
                              <input
                                type="checkbox"
                                checked={selectedBlogPost.tagIds.includes(tag.id)}
                                onChange={() =>
                                  updateSelectedBlogPost({
                                    tagIds: toggleListValue(
                                      selectedBlogPost.tagIds,
                                      tag.id
                                    ),
                                  })
                                }
                              />{" "}
                              {tag.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="admin-note">
                    Select a post from the list, or create a new draft.
                  </p>
                )}
              </div>
            </div>

            <div className="admin-grid" style={{ marginTop: "14px" }}>
              <article className="admin-card">
                <h3 className="admin-card-title">Categories</h3>
                <div className="admin-row">
                  <input
                    className="admin-input"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        async (token, editorEmail) => {
                          const name = newCategoryName.trim();
                          if (!name) return;
                          const category: BlogCategory = {
                            id: createLocalId("cat"),
                            name,
                            slug: slugify(name),
                          };
                          await saveBlogCategory(category, token, editorEmail);
                          setBlogCategories((previous) => [...previous, category]);
                          setNewCategoryName("");
                        },
                        "Category saved.",
                        false
                      )
                    }
                  >
                    Add Category
                  </button>
                </div>
              </article>
              <article className="admin-card">
                <h3 className="admin-card-title">Tags</h3>
                <div className="admin-row">
                  <input
                    className="admin-input"
                    placeholder="New tag name"
                    value={newTagName}
                    onChange={(event) => setNewTagName(event.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() =>
                      void runAction(
                        async (token, editorEmail) => {
                          const name = newTagName.trim();
                          if (!name) return;
                          const tag: BlogTag = {
                            id: createLocalId("tag"),
                            name,
                            slug: slugify(name),
                          };
                          await saveBlogTag(tag, token, editorEmail);
                          setBlogTags((previous) => [...previous, tag]);
                          setNewTagName("");
                        },
                        "Tag saved.",
                        false
                      )
                    }
                  >
                    Add Tag
                  </button>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {tab === "media" ? (
          <section className="admin-panel">
            <h2>Media Library</h2>
            <p className="admin-note">
              Upload assets to Supabase Storage and use public URLs across site
              sections and blog posts.
            </p>
            <div className="admin-row">
              <div className="admin-field" style={{ minWidth: "280px" }}>
                <label>Bucket</label>
                <input
                  className="admin-input"
                  value={uploadBucket}
                  onChange={(event) => setUploadBucket(event.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>Upload File</label>
                <input
                  className="admin-input"
                  type="file"
                  disabled={uploading}
                  onChange={(event) => void handleUpload(event)}
                />
              </div>
            </div>
            <div className="admin-card-list">
              {mediaAssets.map((asset) => (
                <article className="admin-card" key={asset.id}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">{asset.label}</h3>
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() =>
                        void runAction(
                          (token, editorEmail) =>
                            deleteMediaAsset(asset, token, editorEmail),
                          "Media asset removed."
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <p className="admin-note">
                    {asset.bucket}/{asset.path}
                  </p>
                  <input className="admin-input" value={asset.publicUrl} readOnly />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "animations" ? (
          <section className="admin-panel">
            <h2>Animation Controls</h2>
            <p className="admin-note">
              Values are clamped to safe ranges before save and at render-time.
            </p>
            <div className="admin-grid">
              <div className="admin-field">
                <label>Hero Enabled</label>
                <select
                  className="admin-select"
                  value={cmsData.settings.animationSettings.heroEnabled ? "true" : "false"}
                  onChange={(event) =>
                    updateSettings("animationSettings", {
                      ...cmsData.settings.animationSettings,
                      heroEnabled: event.target.value === "true",
                    })
                  }
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              {(
                [
                  "heroSpeed",
                  "heroGlowIntensity",
                  "cursorRepulsionRadius",
                  "cursorRepulsionStrength",
                  "workCardFloatSpeed",
                  "workCardDepth",
                  "techBallFloatSpeed",
                  "techBallIntensity",
                ] as const
              ).map((field) => (
                <div className="admin-field" key={field}>
                  <label>{field}</label>
                  <input
                    className="admin-input"
                    value={cmsData.settings.animationSettings[field]}
                    onChange={(event) =>
                      updateSettings("animationSettings", {
                        ...cmsData.settings.animationSettings,
                        [field]: parseMaybeNumber(
                          event.target.value,
                          cmsData.settings.animationSettings[field]
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="admin-row">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() =>
                  updateSettings(
                    "animationSettings",
                    clampAnimationSettings(cmsData.settings.animationSettings)
                  )
                }
              >
                Validate and Clamp Locally
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  void runAction(
                    (token, editorEmail) => {
                      const normalized = clampAnimationSettings(
                        cmsData.settings.animationSettings
                      );
                      setCmsData((previous) => ({
                        ...previous,
                        settings: {
                          ...previous.settings,
                          animationSettings: normalized,
                        },
                      }));
                      return saveSiteSettings(
                        { ...cmsData.settings, animationSettings: normalized },
                        token,
                        editorEmail
                      );
                    },
                    "Animation settings saved."
                  )
                }
              >
                Save Animation Settings
              </button>
            </div>
          </section>
        ) : null}

        {tab === "admins" ? (
          <section className="admin-panel">
            <h2>Admin Users and Invites</h2>
            {!isSuperAdmin ? (
              <p className="admin-note">
                Admin user management is restricted to the super admin account.
              </p>
            ) : null}
            <div className="admin-card-list">
              {adminUsers.map((user, index) => (
                <article className="admin-card" key={user.email}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">{user.email}</h3>
                    {isSuperAdmin ? (
                      <button
                        type="button"
                        className="admin-mini-btn"
                        onClick={() =>
                          void runAction(
                            (token, editorEmail) =>
                              saveAdminUser(adminUsers[index], token, editorEmail),
                            "Admin user updated."
                          )
                        }
                      >
                        Save
                      </button>
                    ) : null}
                  </div>
                  <div className="admin-grid">
                    <div className="admin-field">
                      <label>Role</label>
                      <select
                        className="admin-select"
                        disabled={!isSuperAdmin}
                        value={user.role}
                        onChange={(event) =>
                          setAdminUsers((previous) =>
                            previous.map((entry, entryIndex) =>
                              entryIndex === index
                                ? {
                                    ...entry,
                                    role: event.target.value as AdminUser["role"],
                                  }
                                : entry
                            )
                          )
                        }
                      >
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Active</label>
                      <select
                        className="admin-select"
                        disabled={!isSuperAdmin}
                        value={user.active ? "true" : "false"}
                        onChange={(event) =>
                          setAdminUsers((previous) =>
                            previous.map((entry, entryIndex) =>
                              entryIndex === index
                                ? {
                                    ...entry,
                                    active: event.target.value === "true",
                                  }
                                : entry
                            )
                          )
                        }
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {isSuperAdmin ? (
              <div className="admin-grid" style={{ marginTop: "14px" }}>
                <article className="admin-card">
                  <h3 className="admin-card-title">Create/Upsert Admin User</h3>
                  <div className="admin-row">
                    <input
                      className="admin-input"
                      placeholder="admin email"
                      value={newAdminEmail}
                      onChange={(event) => setNewAdminEmail(event.target.value)}
                    />
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() =>
                        void runAction(
                          async (token, editorEmail) => {
                            const email = newAdminEmail.trim().toLowerCase();
                            if (!email) return;
                            await saveAdminUser(
                              {
                                id: createLocalId("admin"),
                                email,
                                role: "admin",
                                active: true,
                              },
                              token,
                              editorEmail
                            );
                            setNewAdminEmail("");
                          },
                          "Admin user saved."
                        )
                      }
                    >
                      Save Admin
                    </button>
                  </div>
                </article>
                <article className="admin-card">
                  <h3 className="admin-card-title">Invite Admin</h3>
                  <div className="admin-row">
                    <input
                      className="admin-input"
                      placeholder="invite email"
                      value={newInviteEmail}
                      onChange={(event) => setNewInviteEmail(event.target.value)}
                    />
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() =>
                        void runAction(
                          async (token) => {
                            const email = newInviteEmail.trim().toLowerCase();
                            if (!email || !auth.userEmail) return;
                            await inviteAdminUser(email, auth.userEmail, token);
                            setNewInviteEmail("");
                          },
                          "Invite created."
                        )
                      }
                    >
                      Send Invite
                    </button>
                  </div>
                </article>
              </div>
            ) : null}

            <div className="admin-editor">
              <h2>Invite History</h2>
              <div className="admin-card-list">
                {adminInvites.map((invite) => (
                  <article className="admin-card" key={invite.id}>
                    <h3 className="admin-card-title">{invite.email}</h3>
                    <p className="admin-note">
                      Status: {invite.status} · Invited by {invite.invitedBy} ·{" "}
                      {new Date(invite.createdAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "revisions" ? (
          <section className="admin-panel">
            <h2>Revision History</h2>
            <p className="admin-note">
              Restore a revision to rollback any supported CMS entity.
            </p>
            <div className="admin-card-list">
              {revisions.map((revision) => (
                <article className="admin-card" key={revision.id}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">
                      {revision.entityType} · {revision.entityId}
                    </h3>
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() =>
                        void runAction(
                          (token, editorEmail) =>
                            restoreRevision(revision, token, editorEmail),
                          "Revision restored."
                        )
                      }
                    >
                      Restore
                    </button>
                  </div>
                  <p className="admin-note">
                    Edited by {revision.editedBy} ·{" "}
                    {new Date(revision.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default AdminPage;
