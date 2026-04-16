import {
  AboutSectionContent,
  AdminUser,
  BlogCategory,
  BlogPost,
  BlogStatus,
  BlogTag,
  CareerContent,
  ContentRevision,
  ContactInfo,
  HeroSectionContent,
  MediaAsset,
  PatentItem,
  PublicCmsData,
  SectionContentMap,
  SiteSettings,
  SocialLink,
  TechItem,
  WhatIDoContent,
  WorkItem,
} from "./types";
import {
  DEFAULT_BLOG_CATEGORIES,
  DEFAULT_BLOG_POSTS,
  DEFAULT_BLOG_TAGS,
  DEFAULT_CMS_CONTENT,
  SUPER_ADMIN_EMAIL,
} from "./defaultContent";
import {
  deleteMediaAssetObject,
  isSupabaseConfigured,
  restDelete,
  restInsert,
  restSelect,
  restUpsert,
  uploadMediaAsset,
  getStoragePublicUrl,
} from "./supabaseRest";

type SectionRow = {
  section_key: string;
  content: unknown;
};

type SiteSettingsRow = {
  id: number;
  site_name: string;
  hero_initials: string;
  linkedin_handle: string;
  profile_url: string;
  resume_label: string;
  resume_url: string;
  navigation: SiteSettings["navigation"];
  section_visibility: SiteSettings["sectionVisibility"];
  animation_settings: SiteSettings["animationSettings"];
  updated_at: string;
};

type WorkItemRow = {
  id: string;
  title: string;
  category: string;
  tools: string;
  link: string;
  is_visible: boolean;
  display_order: number;
  is_view_more_tile: boolean;
  animation_preset: string;
};

type PatentItemRow = {
  id: string;
  title: string;
  type: string;
  summary: string;
  meta: string;
  link: string;
  is_visible: boolean;
  display_order: number;
  is_view_more_tile: boolean;
  animation_preset: string;
};

type TechItemRow = {
  id: string;
  label: string;
  is_visible: boolean;
  display_order: number;
};

type SocialLinkRow = {
  id: string;
  label: string;
  url: string;
  platform: SocialLink["platform"];
  is_visible: boolean;
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_html: string | null;
  cover_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category_ids: string[] | null;
};

type AdminInviteRow = {
  id: string;
  email: string;
  invited_by: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
};

type MediaAssetRow = {
  id: string;
  bucket: string;
  path: string;
  public_url: string;
  label: string;
  created_at: string;
};

type ContentRevisionRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  snapshot: unknown;
  edited_by: string;
  created_at: string;
};

type BlogPostTagRow = {
  post_id: string;
  tag_id: string;
};

const normalizeSettings = (row: SiteSettingsRow | undefined): SiteSettings => {
  if (!row) return DEFAULT_CMS_CONTENT.settings;
  return {
    id: row.id,
    siteName: row.site_name,
    heroInitials: row.hero_initials,
    linkedinHandle: row.linkedin_handle,
    profileUrl: row.profile_url,
    resumeLabel: row.resume_label,
    resumeUrl: row.resume_url,
    navigation: row.navigation,
    sectionVisibility: row.section_visibility,
    animationSettings: row.animation_settings,
    updatedAt: row.updated_at,
  };
};

const mapSectionContent = (rows: SectionRow[]) => {
  const mapped: SectionContentMap = { ...DEFAULT_CMS_CONTENT.sections };
  rows.forEach((row) => {
    switch (row.section_key) {
      case "hero":
        mapped.hero = row.content as HeroSectionContent;
        break;
      case "about":
        mapped.about = row.content as AboutSectionContent;
        break;
      case "whatIDo":
        mapped.whatIDo = row.content as WhatIDoContent;
        break;
      case "career":
        mapped.career = row.content as CareerContent;
        break;
      case "contact":
        mapped.contact = row.content as ContactInfo;
        break;
      default:
        break;
    }
  });
  return mapped;
};

const sortByOrder = <T extends { displayOrder: number }>(items: T[]) =>
  [...items].sort((a, b) => a.displayOrder - b.displayOrder);

const mapWorkItem = (row: WorkItemRow): WorkItem => ({
  id: row.id,
  title: row.title,
  category: row.category,
  tools: row.tools,
  link: row.link,
  isVisible: Boolean(row.is_visible),
  displayOrder: Number(row.display_order),
  isViewMoreTile: Boolean(row.is_view_more_tile),
  animationPreset: row.animation_preset || "default",
});

const mapPatentItem = (row: PatentItemRow): PatentItem => ({
  id: row.id,
  title: row.title,
  type: row.type,
  summary: row.summary,
  meta: row.meta,
  link: row.link,
  isVisible: Boolean(row.is_visible),
  displayOrder: Number(row.display_order),
  isViewMoreTile: Boolean(row.is_view_more_tile),
  animationPreset: row.animation_preset || "default",
});

const mapTechItem = (row: TechItemRow): TechItem => ({
  id: row.id,
  label: row.label,
  isVisible: Boolean(row.is_visible),
  displayOrder: Number(row.display_order),
});

const mapSocialLink = (row: SocialLinkRow): SocialLink => ({
  id: row.id,
  label: row.label,
  url: row.url,
  platform: row.platform,
  isVisible: Boolean(row.is_visible),
});

const mapBlogPost = (row: BlogPostRow): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt ?? "",
  bodyHtml: row.body_html ?? "",
  coverImageUrl: row.cover_image_url ?? "",
  seoTitle: row.seo_title ?? "",
  seoDescription: row.seo_description ?? "",
  status: row.status ?? "draft",
  publishedAt: row.published_at ?? null,
  createdAt: row.created_at ?? "",
  updatedAt: row.updated_at ?? "",
  categoryIds: row.category_ids ?? [],
  tagIds: [],
});

const mapMediaAsset = (row: MediaAssetRow): MediaAsset => ({
  id: row.id,
  bucket: row.bucket,
  path: row.path,
  publicUrl: row.public_url,
  label: row.label,
  createdAt: row.created_at,
});

const fetchCmsData = async ({
  includeHidden,
  token,
}: {
  includeHidden: boolean;
  token?: string;
}): Promise<PublicCmsData> => {
  const workFilters = includeHidden
    ? "order=display_order.asc"
    : "is_visible=eq.true&order=display_order.asc";
  const patentFilters = includeHidden
    ? "order=display_order.asc"
    : "is_visible=eq.true&order=display_order.asc";
  const techFilters = includeHidden
    ? "order=display_order.asc"
    : "is_visible=eq.true&order=display_order.asc";
  const socialFilters = includeHidden
    ? "order=label.asc"
    : "is_visible=eq.true&order=label.asc";

  const [settingsRows, sectionRows, workRows, patentRows, techRows, socialRows] =
    await Promise.all([
      restSelect<SiteSettingsRow>("site_settings", "*", "order=id.asc&limit=1", token),
      restSelect<SectionRow>("section_content", "section_key,content", "", token),
      restSelect<WorkItemRow>(
        "work_items",
        "id,title,category,tools,link,is_visible,is_view_more_tile,display_order,animation_preset",
        workFilters,
        token
      ),
      restSelect<PatentItemRow>(
        "patent_items",
        "id,title,type,summary,meta,link,is_visible,is_view_more_tile,display_order,animation_preset",
        patentFilters,
        token
      ),
      restSelect<TechItemRow>("tech_items", "id,label,is_visible,display_order", techFilters, token),
      restSelect<SocialLinkRow>("social_links", "id,label,url,platform,is_visible", socialFilters, token),
    ]);

  const workItems = sortByOrder(workRows.map(mapWorkItem));
  const patentItems = sortByOrder(patentRows.map(mapPatentItem));
  const techItems = sortByOrder(techRows.map(mapTechItem));
  const socialLinks = socialRows.map(mapSocialLink);

  return {
    settings: normalizeSettings(settingsRows[0]),
    sections: mapSectionContent(sectionRows),
    workItems: includeHidden ? workItems : workItems.filter((item) => item.isVisible),
    patentItems: includeHidden
      ? patentItems
      : patentItems.filter((item) => item.isVisible),
    techItems: includeHidden ? techItems : techItems.filter((item) => item.isVisible),
    socialLinks: includeHidden
      ? socialLinks
      : socialLinks.filter((item) => item.isVisible),
  };
};

export const fetchPublicCmsData = async (): Promise<PublicCmsData> => {
  if (!isSupabaseConfigured()) {
    return DEFAULT_CMS_CONTENT;
  }

  try {
    return await fetchCmsData({ includeHidden: false });
  } catch {
    return DEFAULT_CMS_CONTENT;
  }
};

export const fetchAdminCmsData = async (token: string): Promise<PublicCmsData> => {
  return fetchCmsData({ includeHidden: true, token });
};

export const fetchPublicBlogData = async () => {
  if (!isSupabaseConfigured()) {
    return {
      posts: DEFAULT_BLOG_POSTS,
      categories: DEFAULT_BLOG_CATEGORIES,
      tags: DEFAULT_BLOG_TAGS,
    };
  }
  try {
    const [postRows, categories, tags, postTags] = await Promise.all([
      restSelect<BlogPostRow>(
        "blog_posts",
        "id,title,slug,excerpt,body_html,cover_image_url,seo_title,seo_description,status,published_at,created_at,updated_at,category_ids",
        "status=eq.published&order=published_at.desc.nullslast"
      ),
      restSelect<BlogCategory>("blog_categories", "id,name,slug"),
      restSelect<BlogTag>("blog_tags", "id,name,slug"),
      restSelect<BlogPostTagRow>("blog_post_tags", "post_id,tag_id"),
    ]);
    const posts = postRows.map(mapBlogPost).map((post) => {
      const rows = postTags.filter((row) => row.post_id === post.id);
      return {
        ...post,
        tagIds: rows.map((row) => row.tag_id),
      };
    });
    return { posts, categories, tags };
  } catch {
    return {
      posts: DEFAULT_BLOG_POSTS,
      categories: DEFAULT_BLOG_CATEGORIES,
      tags: DEFAULT_BLOG_TAGS,
    };
  }
};

export const fetchAdminBlogData = async (token: string) => {
  const [postRows, categories, tags, postTags] = await Promise.all([
    restSelect<BlogPostRow>(
      "blog_posts",
      "id,title,slug,excerpt,body_html,cover_image_url,seo_title,seo_description,status,published_at,created_at,updated_at,category_ids",
      "order=updated_at.desc",
      token
    ),
    restSelect<BlogCategory>("blog_categories", "id,name,slug", "", token),
    restSelect<BlogTag>("blog_tags", "id,name,slug", "", token),
    restSelect<BlogPostTagRow>("blog_post_tags", "post_id,tag_id", "", token),
  ]);

  const posts = postRows.map(mapBlogPost).map((post) => {
    const rows = postTags.filter((row) => row.post_id === post.id);
    return { ...post, tagIds: rows.map((row) => row.tag_id) };
  });

  return { posts, categories, tags };
};

export const fetchAdminUsers = async (token: string) => {
  const users = await restSelect<AdminUser>(
    "admin_users",
    "id,email,role,active",
    "order=email.asc",
    token
  );
  return users;
};

export const fetchAdminInvites = async (token: string) => {
  const invites = await restSelect<AdminInviteRow>(
    "admin_invites",
    "id,email,invited_by,status,created_at",
    "order=created_at.desc",
    token
  );
  return invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    invitedBy: invite.invited_by,
    status: invite.status,
    createdAt: invite.created_at,
  }));
};

export const fetchMediaAssets = async (token: string) => {
  const rows = await restSelect<MediaAssetRow>(
    "media_assets",
    "id,bucket,path,public_url,label,created_at",
    "order=created_at.desc",
    token
  );
  return rows.map(mapMediaAsset);
};

export const fetchRevisions = async (token: string) => {
  const rows = await restSelect<ContentRevisionRow>(
    "content_revisions",
    "id,entity_type,entity_id,snapshot,edited_by,created_at",
    "order=created_at.desc&limit=80",
    token
  );
  return rows.map((row) => ({
    ...row,
    entityType: (row as unknown as Record<string, unknown>).entity_type as string,
    entityId: (row as unknown as Record<string, unknown>).entity_id as string,
    editedBy: (row as unknown as Record<string, unknown>).edited_by as string,
    createdAt: (row as unknown as Record<string, unknown>).created_at as string,
  }));
};

export const isAdminEmailAllowed = (email: string, users: AdminUser[]) => {
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return true;
  return users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.active
  );
};

export const saveSiteSettings = async (
  settings: SiteSettings,
  token: string,
  editorEmail: string
) => {
  await restUpsert(
    "site_settings",
    {
      id: settings.id,
      site_name: settings.siteName,
      hero_initials: settings.heroInitials,
      linkedin_handle: settings.linkedinHandle,
      profile_url: settings.profileUrl,
      resume_label: settings.resumeLabel,
      resume_url: settings.resumeUrl,
      navigation: settings.navigation,
      section_visibility: settings.sectionVisibility,
      animation_settings: settings.animationSettings,
    },
    "id",
    token
  );
  await createRevision(
    "site_settings",
    String(settings.id),
    settings,
    editorEmail,
    token
  );
};

export const saveSectionContent = async (
  key: keyof SectionContentMap,
  content: SectionContentMap[keyof SectionContentMap],
  token: string,
  editorEmail: string
) => {
  await restUpsert(
    "section_content",
    { section_key: key, content },
    "section_key",
    token
  );
  await createRevision("section_content", key, content, editorEmail, token);
};

export const saveWorkItems = async (
  workItems: WorkItem[],
  token: string,
  editorEmail: string
) => {
  const payload = workItems.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    tools: item.tools,
    link: item.link,
    is_visible: item.isVisible,
    display_order: item.displayOrder,
    is_view_more_tile: item.isViewMoreTile,
    animation_preset: item.animationPreset,
  }));
  await restUpsert("work_items", payload, "id", token);
  await createRevision("work_items", "all", payload, editorEmail, token);
};

export const savePatentItems = async (
  patentItems: PatentItem[],
  token: string,
  editorEmail: string
) => {
  const payload = patentItems.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    summary: item.summary,
    meta: item.meta,
    link: item.link,
    is_visible: item.isVisible,
    display_order: item.displayOrder,
    is_view_more_tile: item.isViewMoreTile,
    animation_preset: item.animationPreset,
  }));
  await restUpsert("patent_items", payload, "id", token);
  await createRevision("patent_items", "all", payload, editorEmail, token);
};

export const saveTechItems = async (
  techItems: TechItem[],
  token: string,
  editorEmail: string
) => {
  const payload = techItems.map((item) => ({
    id: item.id,
    label: item.label,
    is_visible: item.isVisible,
    display_order: item.displayOrder,
  }));
  await restUpsert("tech_items", payload, "id", token);
  await createRevision("tech_items", "all", payload, editorEmail, token);
};

export const saveSocialLinks = async (
  links: SocialLink[],
  token: string,
  editorEmail: string
) => {
  const payload = links.map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url,
    platform: item.platform,
    is_visible: item.isVisible,
  }));
  await restUpsert("social_links", payload, "id", token);
  await createRevision("social_links", "all", payload, editorEmail, token);
};

export const saveBlogPost = async (
  post: BlogPost,
  token: string,
  editorEmail: string
) => {
  const normalizedStatus: BlogStatus =
    post.status === "published" ? "published" : "draft";
  const publishedAt =
    normalizedStatus === "published"
      ? post.publishedAt ?? new Date().toISOString()
      : null;

  await restUpsert(
    "blog_posts",
    {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body_html: post.bodyHtml,
      cover_image_url: post.coverImageUrl,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      status: normalizedStatus,
      published_at: publishedAt,
      category_ids: post.categoryIds,
    },
    "id",
    token
  );

  await restDelete("blog_post_tags", `post_id=eq.${post.id}`, token);
  if (post.tagIds.length) {
    await restUpsert(
      "blog_post_tags",
      post.tagIds.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      })),
      "post_id,tag_id",
      token
    );
  }
  await createRevision("blog_posts", post.id, post, editorEmail, token);
};

export const deleteBlogPost = async (id: string, token: string) => {
  await restDelete("blog_post_tags", `post_id=eq.${id}`, token);
  await restDelete("blog_posts", `id=eq.${id}`, token);
};

export const saveBlogCategory = async (
  category: BlogCategory,
  token: string,
  editorEmail: string
) => {
  await restUpsert("blog_categories", category, "id", token);
  await createRevision("blog_categories", category.id, category, editorEmail, token);
};

export const saveBlogTag = async (
  tag: BlogTag,
  token: string,
  editorEmail: string
) => {
  await restUpsert("blog_tags", tag, "id", token);
  await createRevision("blog_tags", tag.id, tag, editorEmail, token);
};

export const saveAdminUser = async (
  adminUser: AdminUser,
  token: string,
  editorEmail: string
) => {
  await restUpsert(
    "admin_users",
    {
      id: adminUser.id,
      email: adminUser.email.toLowerCase(),
      role: adminUser.role,
      active: adminUser.active,
    },
    "email",
    token
  );
  await createRevision("admin_users", adminUser.email, adminUser, editorEmail, token);
};

export const inviteAdminUser = async (
  email: string,
  inviterEmail: string,
  token: string
) => {
  await restInsert(
    "admin_invites",
    {
      email,
      invited_by: inviterEmail,
      status: "pending",
    },
    token
  );
};

export const uploadMedia = async (
  file: File,
  bucket: string,
  token: string,
  editorEmail: string
) => {
  const extension = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : "";
  const path = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  await uploadMediaAsset(bucket, path, file, token);
  const publicUrl = getStoragePublicUrl(bucket, path);
  const asset = await restInsert(
    "media_assets",
    {
      bucket,
      path,
      public_url: publicUrl,
      label: file.name,
    },
    token
  );
  await createRevision("media_assets", path, asset, editorEmail, token);
  return publicUrl;
};

export const deleteMediaAsset = async (
  asset: MediaAsset,
  token: string,
  editorEmail: string
) => {
  await deleteMediaAssetObject(asset.bucket, asset.path, token);
  await restDelete("media_assets", `id=eq.${asset.id}`, token);
  await createRevision("media_assets_deleted", asset.id, asset, editorEmail, token);
};

export const restoreRevision = async (
  revision: ContentRevision,
  token: string,
  editorEmail: string
) => {
  switch (revision.entityType) {
    case "site_settings":
      await saveSiteSettings(revision.snapshot as SiteSettings, token, editorEmail);
      return;
    case "section_content":
      await saveSectionContent(
        revision.entityId as keyof SectionContentMap,
        revision.snapshot as SectionContentMap[keyof SectionContentMap],
        token,
        editorEmail
      );
      return;
    case "work_items":
      await saveWorkItems(revision.snapshot as WorkItem[], token, editorEmail);
      return;
    case "patent_items":
      await savePatentItems(revision.snapshot as PatentItem[], token, editorEmail);
      return;
    case "tech_items":
      await saveTechItems(revision.snapshot as TechItem[], token, editorEmail);
      return;
    case "social_links":
      await saveSocialLinks(revision.snapshot as SocialLink[], token, editorEmail);
      return;
    case "blog_posts":
      await saveBlogPost(revision.snapshot as BlogPost, token, editorEmail);
      return;
    case "blog_categories":
      await saveBlogCategory(revision.snapshot as BlogCategory, token, editorEmail);
      return;
    case "blog_tags":
      await saveBlogTag(revision.snapshot as BlogTag, token, editorEmail);
      return;
    case "admin_users":
      await saveAdminUser(revision.snapshot as AdminUser, token, editorEmail);
      return;
    default:
      return;
  }
};

export const createRevision = async (
  entityType: string,
  entityId: string,
  snapshot: unknown,
  editorEmail: string,
  token: string
) => {
  await restInsert(
    "content_revisions",
    {
      entity_type: entityType,
      entity_id: entityId,
      snapshot,
      edited_by: editorEmail,
    },
    token
  );
};
