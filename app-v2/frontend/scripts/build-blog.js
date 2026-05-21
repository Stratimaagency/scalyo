#!/usr/bin/env node
/**
 * Scalyo Blog Build Script
 * Reads markdown articles from src/blog/articles/
 * Generates static HTML pages in dist/blog/[slug]/index.html
 * Generates dist/sitemap.xml
 *
 * Run after vite build: node scripts/build-blog.js
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { marked } from 'marked'
import matter from 'gray-matter'

const SITE_URL = 'https://scalyo.app'
const DIST_DIR = join(process.cwd(), 'dist')
const ARTICLES_DIR = join(process.cwd(), 'src/blog/articles')
const TEMPLATE_PATH = join(process.cwd(), 'src/blog/template.html')

// ── i18n for static blog pages ──
const i18n = {
  fr: {
    nav_blog: 'Blog', nav_features: 'Fonctionnalités', nav_pricing: 'Tarifs', nav_cta: 'Essai gratuit',
    cta_title: 'Prêt à transformer votre Customer Success ?',
    cta_body: 'Scalyo aide les équipes CS à réduire le churn et augmenter la rétention nette.',
    cta_btn: 'Commencer →',
    sub_title: 'Recevez nos meilleurs contenus CS', sub_desc: 'Stratégies, frameworks et retours d\'expérience pour les leaders Customer Success. Un email par semaine, zéro spam.', sub_placeholder: 'votre@email.com', sub_btn: 'S\'inscrire', sub_privacy: 'Vos données restent privées. Désinscription en un clic.', sub_success: 'Bienvenue ! Vous recevrez notre prochain article.', sub_already: 'Vous êtes déjà inscrit(e).', sub_error: 'Une erreur est survenue, réessayez.',
  },
  en: {
    nav_blog: 'Blog', nav_features: 'Features', nav_pricing: 'Pricing', nav_cta: 'Free Trial',
    cta_title: 'Ready to transform your Customer Success?',
    cta_body: 'Scalyo helps CS teams reduce churn and boost net retention.',
    cta_btn: 'Get started →',
    sub_title: 'Get our best CS content', sub_desc: 'Strategies, frameworks and insights for Customer Success leaders. One email per week, zero spam.', sub_placeholder: 'your@email.com', sub_btn: 'Subscribe', sub_privacy: 'Your data stays private. Unsubscribe in one click.', sub_success: 'Welcome! You\'ll receive our next article.', sub_already: 'You\'re already subscribed.', sub_error: 'Something went wrong, please try again.',
  },
  ko: {
    nav_blog: '블로그', nav_features: '기능', nav_pricing: '요금', nav_cta: '무료 체험',
    cta_title: 'Customer Success를 혁신할 준비가 되셨나요?',
    cta_body: 'Scalyo는 CS 팀의 이탈률 감소와 순유지율 향상을 지원합니다.',
    cta_btn: '시작하기 →',
    sub_title: '최고의 CS 콘텐츠를 받아보세요', sub_desc: 'Customer Success 리더를 위한 전략, 프레임워크, 인사이트. 주 1회 이메일, 스팸 없음.', sub_placeholder: 'your@email.com', sub_btn: '구독하기', sub_privacy: '개인정보는 안전하게 보호됩니다. 원클릭 구독 해지.', sub_success: '환영합니다! 다음 기사를 보내드리겠습니다.', sub_already: '이미 구독 중입니다.', sub_error: '오류가 발생했습니다. 다시 시도해주세요.',
  },
}

// ── Read template ──
const template = readFileSync(TEMPLATE_PATH, 'utf-8')

// ── Read and parse all articles ──
if (!existsSync(ARTICLES_DIR)) {
  console.log('[blog] No articles directory found, skipping blog build')
  process.exit(0)
}

const mdFiles = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
if (mdFiles.length === 0) {
  console.log('[blog] No articles found, skipping blog build')
  process.exit(0)
}

console.log(`[blog] Building ${mdFiles.length} article(s)...`)

const articles = mdFiles.map(file => {
  const raw = readFileSync(join(ARTICLES_DIR, file), 'utf-8')
  const { data: meta, content } = matter(raw)
  const slug = meta.slug || basename(file, '.md')
  const html = marked(content)

  return { ...meta, slug, html, file }
}).sort((a, b) => new Date(b.date) - new Date(a.date))

// ── Generate HTML for each article ──
for (const article of articles) {
  const {
    slug, title, description, date, category, keywords,
    lang = 'fr', author = 'Scalyo', og_image,
    hreflang_fr, hreflang_en, hreflang_ko,
    html
  } = article

  const articleUrl = `${SITE_URL}/blog/${slug}`
  const formattedDate = new Date(date).toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  let hreflangTags = ''
  if (hreflang_fr) hreflangTags += `<link rel="alternate" hreflang="fr" href="${SITE_URL}/blog/${hreflang_fr}" />\n    `
  if (hreflang_en) hreflangTags += `<link rel="alternate" hreflang="en" href="${SITE_URL}/blog/${hreflang_en}" />\n    `
  if (hreflang_ko) hreflangTags += `<link rel="alternate" hreflang="ko" href="${SITE_URL}/blog/${hreflang_ko}" />\n    `

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: title, description,
    author: { '@type': 'Organization', name: author, url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Scalyo', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/scalyo-logo.png` } },
    datePublished: date, dateModified: article.updated || date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    image: og_image || `${SITE_URL}/og-default.png`, keywords: (keywords || []).join(', '), inLanguage: lang,
  })

  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Scalyo', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: articleUrl },
    ]
  })

  const t = i18n[lang] || i18n.fr
  const page = template
    .replace(/{{title}}/g, title).replace(/{{description}}/g, description)
    .replace(/{{url}}/g, articleUrl).replace(/{{og_image}}/g, og_image || `${SITE_URL}/og-default.png`)
    .replace(/{{lang}}/g, lang).replace(/{{date}}/g, formattedDate).replace(/{{date_iso}}/g, date)
    .replace(/{{category}}/g, category || '').replace(/{{author}}/g, author)
    .replace(/{{keywords}}/g, (keywords || []).join(', '))
    .replace(/{{hreflang_tags}}/g, hreflangTags).replace(/{{json_ld}}/g, jsonLd)
    .replace(/{{breadcrumb_ld}}/g, breadcrumbLd).replace(/{{content}}/g, html)
    .replace(/{{nav_blog}}/g, t.nav_blog).replace(/{{nav_features}}/g, t.nav_features)
    .replace(/{{nav_pricing}}/g, t.nav_pricing).replace(/{{nav_cta}}/g, t.nav_cta)
    .replace(/{{cta_title}}/g, t.cta_title).replace(/{{cta_body}}/g, t.cta_body)
    .replace(/{{cta_btn}}/g, t.cta_btn)
    .replace(/{{sub_title}}/g, t.sub_title).replace(/{{sub_desc}}/g, t.sub_desc)
    .replace(/{{sub_placeholder}}/g, t.sub_placeholder).replace(/{{sub_btn}}/g, t.sub_btn)
    .replace(/{{sub_privacy}}/g, t.sub_privacy).replace(/{{sub_success}}/g, t.sub_success)
    .replace(/{{sub_already}}/g, t.sub_already).replace(/{{sub_error}}/g, t.sub_error)

  const outDir = join(DIST_DIR, 'blog', slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), page)
  console.log(`  ✓ /blog/${slug}`)
}

const now = new Date().toISOString().slice(0, 10)
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>${SITE_URL}/blog</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n  <url><loc>${SITE_URL}/cgu</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>\n  <url><loc>${SITE_URL}/privacy</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>\n`
for (const a of articles) { sitemap += `  <url><loc>${SITE_URL}/blog/${a.slug}</loc><lastmod>${a.updated || a.date}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n` }
sitemap += `</urlset>`
writeFileSync(join(DIST_DIR, 'sitemap.xml'), sitemap)
console.log(`  ✓ sitemap.xml (${articles.length + 4} URLs)`)

const indexData = articles.map(({ slug, title, description, date, category, lang, keywords }) => ({ slug, title, description, date, category, lang, keywords }))
mkdirSync(join(DIST_DIR, 'blog'), { recursive: true })
writeFileSync(join(DIST_DIR, 'blog', 'articles.json'), JSON.stringify(indexData, null, 2))
console.log(`  ✓ blog/articles.json`)
console.log(`[blog] Done — ${articles.length} article(s) built`)
