begin;

insert into public.site_settings (
  id,
  site_name,
  hero_initials,
  linkedin_handle,
  profile_url,
  resume_label,
  resume_url,
  navigation,
  section_visibility,
  animation_settings
)
values (
  1,
  'Mayur Kanojiya Portfolio',
  'MK',
  'linkedin.com/in/mayurkanojiya',
  'https://www.linkedin.com/in/mayurkanojiya/',
  'PROFILE',
  'https://www.linkedin.com/in/mayurkanojiya/',
  '[
    {"label":"ABOUT","href":"#about","type":"section","isVisible":true},
    {"label":"WORK","href":"#work","type":"section","isVisible":true},
    {"label":"PATENTS","href":"#patents","type":"section","isVisible":true},
    {"label":"BLOG","href":"/blog","type":"route","isVisible":true},
    {"label":"CONTACT","href":"#contact","type":"section","isVisible":true}
  ]'::jsonb,
  '{
    "landing": true,
    "about": true,
    "whatIDo": true,
    "career": true,
    "work": true,
    "patents": true,
    "techstack": true,
    "contact": true
  }'::jsonb,
  '{
    "heroEnabled": true,
    "heroSpeed": 1.7,
    "heroGlowIntensity": 0.6,
    "cursorRepulsionRadius": 180,
    "cursorRepulsionStrength": 96,
    "workCardFloatSpeed": 8,
    "workCardDepth": 45,
    "techBallFloatSpeed": 8,
    "techBallIntensity": 12
  }'::jsonb
)
on conflict (id) do update
set
  site_name = excluded.site_name,
  hero_initials = excluded.hero_initials,
  linkedin_handle = excluded.linkedin_handle,
  profile_url = excluded.profile_url,
  resume_label = excluded.resume_label,
  resume_url = excluded.resume_url,
  navigation = excluded.navigation,
  section_visibility = excluded.section_visibility,
  animation_settings = excluded.animation_settings;

insert into public.section_content (section_key, content)
values
  (
    'hero',
    '{
      "greeting":"Hello! I''m",
      "firstName":"MAYUR",
      "lastName":"KANOJIYA",
      "rolePrefix":"AI Architect &",
      "rolePrimary":"LLM",
      "roleSecondary":"Agents",
      "taglinePrimary":"Vision",
      "taglineSecondary":"Scale"
    }'::jsonb
  ),
  (
    'about',
    '{
      "title":"About Me",
      "body":"I am an AI Architect at Oracle AI and ML, focused on building production-grade LLM systems, multi-agent workflows, and computer-vision solutions for enterprise use-cases. I enjoy translating complex AI ambitions into deterministic systems that scale with reliability, guardrails, and measurable impact."
    }'::jsonb
  ),
  (
    'whatIDo',
    '{
      "titlePrimary":"WHAT",
      "titleSecondary":"I DO",
      "cards":[
        {
          "title":"AI ARCHITECTURE",
          "subtitle":"Deterministic LLM & Agent Systems",
          "description":"I design enterprise AI systems that stay reliable in production, combining agent orchestration, structured output paths, and quality guardrails.",
          "skills":["LLMs & agent design","RAG & retrieval","Prompt systems","Evals & guardrails","Workflow orchestration","Enterprise integration"]
        },
        {
          "title":"VISION & SCALE",
          "subtitle":"Computer Vision and Edge AI Delivery",
          "description":"I build and ship vision systems for real-world constraints, including low-latency inference, OCR pipelines, and performance-aware deployment.",
          "skills":["Computer vision","Edge AI","OpenVINO optimization","Python","MLOps practices","Reliability engineering"]
        }
      ]
    }'::jsonb
  ),
  (
    'career',
    '{
      "title":"My career",
      "highlight":"&",
      "items":[
        {
          "role":"Project Lead Development",
          "company":"Oracle AI and ML",
          "duration":"NOW",
          "description":"Leading AI and ML delivery with a focus on enterprise LLM systems, multi-agent architecture, and production-grade execution."
        },
        {
          "role":"Senior Application Engineer",
          "company":"Oracle",
          "duration":"2021–23",
          "description":"Built and scaled enterprise applications while driving AI-ready architecture, platform reliability, and cross-functional delivery."
        },
        {
          "role":"Software Engineer",
          "company":"Hidden Brains InfoTech",
          "duration":"2018–21",
          "description":"Developed full-stack solutions and contributed to production deployments across business-critical software projects."
        },
        {
          "role":"Software Developer",
          "company":"iView Labs",
          "duration":"2016–18",
          "description":"Started my engineering journey building web applications and core backend features with strong execution discipline."
        }
      ]
    }'::jsonb
  ),
  (
    'contact',
    '{
      "title":"Contact",
      "connectTitle":"Connect",
      "educationTitle":"Education",
      "socialTitle":"Social",
      "footerTitle":"Designed and Developed",
      "footerHighlight":"Mayur Kanojiya",
      "copyrightText":"2026",
      "educationLines":["Master''s in Data Science, BITS Pilani","Bachelor''s in Computer Engineering"],
      "connectLinks":[
        {"label":"Email — kanojiyamayur@gmail.com","href":"mailto:kanojiyamayur@gmail.com"},
        {"label":"LinkedIn — mayurkanojiya","href":"https://www.linkedin.com/in/mayurkanojiya/"}
      ]
    }'::jsonb
  )
on conflict (section_key) do update set content = excluded.content;

insert into public.work_items (id, title, category, tools, link, is_visible, display_order, is_view_more_tile, animation_preset)
values
  ('work-1', 'Autonomous Incident Agent Team', 'Multi-Agent Incident Intelligence', 'Role orchestration, escalation routing, deterministic decision paths', 'https://github.com/KMKnation', true, 1, false, 'agents'),
  ('work-2', 'Deterministic JSON-to-Markdown Engine', 'LLM Output Compiler', 'Schema alignment, low-hallucination output, UI-ready formatting', 'https://github.com/KMKnation', true, 2, false, 'compiler'),
  ('work-3', 'Adaptive Query Radar', 'Emergent Signal Detection', 'Trend clustering, alert intelligence, patent-backed architecture', 'https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081', true, 3, false, 'radar'),
  ('work-4', 'Edge Vision Sentinel', 'Computer Vision on Edge', 'OCR, recognition, low-latency inference, OpenVINO optimization', 'https://www.linkedin.com/in/mayurkanojiya/', true, 4, false, 'vision'),
  ('work-5', 'Explore Complete Work Portfolio', 'Case Studies and Deep Dives', 'Architecture breakdowns, execution notes, outcomes, and showcase snapshots', '/work-showcase', true, 5, true, 'viewmore')
on conflict (id) do update
set
  title = excluded.title,
  category = excluded.category,
  tools = excluded.tools,
  link = excluded.link,
  is_visible = excluded.is_visible,
  display_order = excluded.display_order,
  is_view_more_tile = excluded.is_view_more_tile,
  animation_preset = excluded.animation_preset;

insert into public.patent_items (id, title, type, summary, meta, link, is_visible, display_order, is_view_more_tile, animation_preset)
values
  ('patent-1', 'US Patent 12,461,979', 'Granted Patent', 'Adaptive query intelligence for enterprise support operations, focused on identifying emergent incident patterns and response signals.', 'Granted: November 4, 2025', 'https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081', true, 1, false, 'granted'),
  ('patent-2', 'Publication 20250278444', 'Patent Publication', 'Published technical disclosure covering adaptive detection architecture, clustering, and operational escalation intelligence.', 'Publication ID: 20250278444', 'https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081', true, 2, false, 'publication'),
  ('patent-3', 'Query Radar Patent Domain', 'Innovation Focus', 'Core domain includes real-time signal extraction from support queries, anomaly surfacing, and enterprise-scale response orchestration.', 'Area: AI + Enterprise Support Intelligence', 'https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081', true, 3, false, 'focus'),
  ('patent-4', 'Explore Full Patent Portfolio', 'View More', 'Open the dedicated patent page for the complete timeline, domains, and deeper innovation notes.', 'Patent Library', '/patent-showcase', true, 4, true, 'viewmore')
on conflict (id) do update
set
  title = excluded.title,
  type = excluded.type,
  summary = excluded.summary,
  meta = excluded.meta,
  link = excluded.link,
  is_visible = excluded.is_visible,
  display_order = excluded.display_order,
  is_view_more_tile = excluded.is_view_more_tile,
  animation_preset = excluded.animation_preset;

insert into public.tech_items (id, label, is_visible, display_order)
values
  ('tech-1', 'React', true, 1),
  ('tech-2', 'Node.js', true, 2),
  ('tech-3', 'TypeScript', true, 3),
  ('tech-4', 'Python', true, 4),
  ('tech-5', 'LLM Systems', true, 5),
  ('tech-6', 'Multi-Agent Orchestration', true, 6),
  ('tech-7', 'Computer Vision', true, 7),
  ('tech-8', 'OpenVINO', true, 8),
  ('tech-9', 'RAG Pipelines', true, 9),
  ('tech-10', 'Enterprise AI', true, 10),
  ('tech-11', 'MLOps', true, 11),
  ('tech-12', 'GenAI', true, 12)
on conflict (id) do update
set
  label = excluded.label,
  is_visible = excluded.is_visible,
  display_order = excluded.display_order;

insert into public.social_links (id, label, url, platform, is_visible)
values
  ('social-1', 'GitHub', 'https://github.com/KMKnation', 'github', true),
  ('social-2', 'LinkedIn', 'https://www.linkedin.com/in/mayurkanojiya/', 'linkedin', true),
  ('social-3', 'Email', 'mailto:kanojiyamayur@gmail.com', 'email', true),
  ('social-4', 'Patent Record', 'https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081', 'doc', true)
on conflict (id) do update
set
  label = excluded.label,
  url = excluded.url,
  platform = excluded.platform,
  is_visible = excluded.is_visible;

insert into public.blog_categories (id, name, slug)
values
  ('cat-1', 'LLM Systems', 'llm-systems'),
  ('cat-2', 'Agent Architecture', 'agent-architecture'),
  ('cat-3', 'Computer Vision', 'computer-vision')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into public.blog_tags (id, name, slug)
values
  ('tag-1', 'RAG', 'rag'),
  ('tag-2', 'OpenVINO', 'openvino'),
  ('tag-3', 'Prompt Engineering', 'prompt-engineering'),
  ('tag-4', 'Evaluation', 'evaluation')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into public.admin_users (email, role, active)
values ('kanojiyamayur@gmail.com', 'super_admin', true)
on conflict (email) do update
set role = excluded.role, active = excluded.active;

commit;
