begin;

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id bigint primary key default 1 check (id = 1),
  site_name text not null,
  hero_initials text not null,
  linkedin_handle text not null,
  profile_url text not null,
  resume_label text not null,
  resume_url text not null,
  navigation jsonb not null default '[]'::jsonb,
  section_visibility jsonb not null default '{}'::jsonb,
  animation_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.section_content (
  section_key text primary key check (section_key in ('hero', 'about', 'whatIDo', 'career', 'contact')),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.work_items (
  id text primary key,
  title text not null,
  category text not null,
  tools text not null default '',
  link text not null default '',
  is_visible boolean not null default true,
  display_order int not null default 1,
  is_view_more_tile boolean not null default false,
  animation_preset text not null default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patent_items (
  id text primary key,
  title text not null,
  type text not null default '',
  summary text not null default '',
  meta text not null default '',
  link text not null default '',
  is_visible boolean not null default true,
  display_order int not null default 1,
  is_view_more_tile boolean not null default false,
  animation_preset text not null default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tech_items (
  id text primary key,
  label text not null,
  is_visible boolean not null default true,
  display_order int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id text primary key,
  label text not null,
  url text not null,
  platform text not null check (platform in ('github', 'linkedin', 'email', 'doc')),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body_html text not null default '',
  cover_image_url text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  category_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_post_tags (
  post_id text not null references public.blog_posts(id) on delete cascade,
  tag_id text not null references public.blog_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text not null,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('super_admin', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  snapshot jsonb not null,
  edited_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_work_items_order on public.work_items (display_order);
create index if not exists idx_patent_items_order on public.patent_items (display_order);
create index if not exists idx_tech_items_order on public.tech_items (display_order);
create index if not exists idx_blog_posts_status_pub on public.blog_posts (status, published_at desc);
create index if not exists idx_content_revisions_entity on public.content_revisions (entity_type, entity_id);
create index if not exists idx_admin_users_email_lower on public.admin_users (lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_work_items_updated_at on public.work_items;
create trigger trg_work_items_updated_at
before update on public.work_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_patent_items_updated_at on public.patent_items;
create trigger trg_patent_items_updated_at
before update on public.patent_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_tech_items_updated_at on public.tech_items;
create trigger trg_tech_items_updated_at
before update on public.tech_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_social_links_updated_at on public.social_links;
create trigger trg_social_links_updated_at
before update on public.social_links
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_categories_updated_at on public.blog_categories;
create trigger trg_blog_categories_updated_at
before update on public.blog_categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_tags_updated_at on public.blog_tags;
create trigger trg_blog_tags_updated_at
before update on public.blog_tags
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_auth_email() = 'kanojiyamayur@gmail.com'
    or exists (
      select 1
      from public.admin_users au
      where lower(au.email) = public.current_auth_email()
        and au.active = true
    );
$$;

create or replace function public.is_super_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_auth_email() = 'kanojiyamayur@gmail.com'
    or exists (
      select 1
      from public.admin_users au
      where lower(au.email) = public.current_auth_email()
        and au.active = true
        and au.role = 'super_admin'
    );
$$;

grant execute on function public.current_auth_email() to anon, authenticated;
grant execute on function public.is_admin_user() to anon, authenticated;
grant execute on function public.is_super_admin_user() to anon, authenticated;

alter table public.site_settings enable row level security;
alter table public.section_content enable row level security;
alter table public.work_items enable row level security;
alter table public.patent_items enable row level security;
alter table public.tech_items enable row level security;
alter table public.social_links enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.media_assets enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_invites enable row level security;
alter table public.content_revisions enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings for select
using (true);

drop policy if exists "Admins write site settings" on public.site_settings;
create policy "Admins write site settings"
on public.site_settings for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read section content" on public.section_content;
create policy "Public read section content"
on public.section_content for select
using (true);

drop policy if exists "Admins write section content" on public.section_content;
create policy "Admins write section content"
on public.section_content for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read visible work items" on public.work_items;
create policy "Public read visible work items"
on public.work_items for select
using (is_visible = true or public.is_admin_user());

drop policy if exists "Admins write work items" on public.work_items;
create policy "Admins write work items"
on public.work_items for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read visible patent items" on public.patent_items;
create policy "Public read visible patent items"
on public.patent_items for select
using (is_visible = true or public.is_admin_user());

drop policy if exists "Admins write patent items" on public.patent_items;
create policy "Admins write patent items"
on public.patent_items for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read visible tech items" on public.tech_items;
create policy "Public read visible tech items"
on public.tech_items for select
using (is_visible = true or public.is_admin_user());

drop policy if exists "Admins write tech items" on public.tech_items;
create policy "Admins write tech items"
on public.tech_items for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read visible social links" on public.social_links;
create policy "Public read visible social links"
on public.social_links for select
using (is_visible = true or public.is_admin_user());

drop policy if exists "Admins write social links" on public.social_links;
create policy "Admins write social links"
on public.social_links for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read blog categories" on public.blog_categories;
create policy "Public read blog categories"
on public.blog_categories for select
using (true);

drop policy if exists "Admins write blog categories" on public.blog_categories;
create policy "Admins write blog categories"
on public.blog_categories for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read blog tags" on public.blog_tags;
create policy "Public read blog tags"
on public.blog_tags for select
using (true);

drop policy if exists "Admins write blog tags" on public.blog_tags;
create policy "Admins write blog tags"
on public.blog_tags for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read blog posts" on public.blog_posts;
create policy "Public read blog posts"
on public.blog_posts for select
using (status = 'published' or public.is_admin_user());

drop policy if exists "Admins write blog posts" on public.blog_posts;
create policy "Admins write blog posts"
on public.blog_posts for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read blog post tags" on public.blog_post_tags;
create policy "Public read blog post tags"
on public.blog_post_tags for select
using (true);

drop policy if exists "Admins write blog post tags" on public.blog_post_tags;
create policy "Admins write blog post tags"
on public.blog_post_tags for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Public read media assets" on public.media_assets;
create policy "Public read media assets"
on public.media_assets for select
using (true);

drop policy if exists "Admins write media assets" on public.media_assets;
create policy "Admins write media assets"
on public.media_assets for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Admins read admin users" on public.admin_users;
create policy "Admins read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin_user());

drop policy if exists "Super admins write admin users" on public.admin_users;
create policy "Super admins write admin users"
on public.admin_users for all
to authenticated
using (public.is_super_admin_user())
with check (public.is_super_admin_user());

drop policy if exists "Admins read invites" on public.admin_invites;
create policy "Admins read invites"
on public.admin_invites for select
to authenticated
using (public.is_admin_user());

drop policy if exists "Super admins write invites" on public.admin_invites;
create policy "Super admins write invites"
on public.admin_invites for all
to authenticated
using (public.is_super_admin_user())
with check (public.is_super_admin_user());

drop policy if exists "Admins read revisions" on public.content_revisions;
create policy "Admins read revisions"
on public.content_revisions for select
to authenticated
using (public.is_admin_user());

drop policy if exists "Admins write revisions" on public.content_revisions;
create policy "Admins write revisions"
on public.content_revisions for insert
to authenticated
with check (public.is_admin_user());

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read portfolio media objects" on storage.objects;
create policy "Public read portfolio media objects"
on storage.objects for select
using (bucket_id = 'portfolio-media');

drop policy if exists "Admins write portfolio media objects" on storage.objects;
create policy "Admins write portfolio media objects"
on storage.objects for all
to authenticated
using (bucket_id = 'portfolio-media' and public.is_admin_user())
with check (bucket_id = 'portfolio-media' and public.is_admin_user());

commit;
