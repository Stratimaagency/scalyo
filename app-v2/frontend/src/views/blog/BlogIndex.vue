<template>
<div class="blog-page">
  <div class="blog-container">
    <router-link to="/" class="blog-back">{{ t('blog_back') }}</router-link>
    <h1 class="blog-title">{{ t('blog_title') }}</h1>
    <p class="blog-subtitle">{{ t('blog_subtitle') }}</p>

    <div class="blog-coming">
      <div class="blog-coming-icon">📝</div>
      <p class="blog-coming-text">{{ t('blog_coming') }}</p>
      <div class="blog-notify">
        <p class="blog-notify-label">{{ t('blog_notify') }}</p>
        <div class="blog-notify-form">
          <input
            v-model="email"
            type="email"
            :placeholder="t('blog_email_placeholder')"
            class="blog-input"
            @keyup.enter="subscribe"
          />
          <button class="blog-btn" @click="subscribe" :disabled="subscribed">
            {{ subscribed ? '✓' : t('blog_cta') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { L } from '@/i18n/landing'

const locale = ref(navigator.language?.startsWith('ko') ? 'kr' : navigator.language?.startsWith('en') ? 'en' : 'fr')
function t(key) {
  return (L[locale.value] || L.fr)[key] || L.fr[key] || key
}

const email = ref('')
const subscribed = ref(false)

async function subscribe() {
  if (!email.value || subscribed.value) return
  // TODO: connect to email capture (Supabase or Resend)
  subscribed.value = true
}
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 60px 24px;
}
.blog-container {
  max-width: 720px;
  margin: 0 auto;
}
.blog-back {
  font-size: .85rem;
  color: #7c3aed;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 32px;
}
.blog-back:hover { text-decoration: underline; }
.blog-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 12px;
}
.blog-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 48px;
}
.blog-coming {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  border: 1px solid #e2e8f0;
}
.blog-coming-icon {
  font-size: 2.4rem;
  margin-bottom: 16px;
}
.blog-coming-text {
  font-size: 1.15rem;
  color: #1a1a2e;
  font-weight: 600;
  margin-bottom: 32px;
}
.blog-notify-label {
  font-size: .9rem;
  color: #64748b;
  margin-bottom: 16px;
}
.blog-notify-form {
  display: flex;
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}
.blog-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: .9rem;
  outline: none;
  transition: border-color .2s;
}
.blog-input:focus { border-color: #7c3aed; }
.blog-btn {
  padding: 12px 24px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s;
  white-space: nowrap;
}
.blog-btn:hover { background: #6d28d9; }
.blog-btn:disabled { background: #10b981; cursor: default; }
@media (max-width: 480px) {
  .blog-notify-form { flex-direction: column; }
  .blog-title { font-size: 1.8rem; }
}
</style>
