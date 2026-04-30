<template>
  <section class="integ-section anim-section" data-anim="fade-up">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">{{ t('integ_tag') }}</span>
        <h2 v-html="t('integ_h2')"></h2>
        <p class="section-sub">{{ t('integ_sub') }}</p>
      </div>
      <div class="integ-grid">
        <div v-for="ig in integrations" :key="ig.name" class="integ-card">
          <span class="integ-icon">{{ ig.icon }}</span>
          <strong>{{ ig.name }}</strong>
          <small>{{ ig.tag }}</small>
          <span class="integ-avail">{{ t('integ_available') }}</span>
        </div>
      </div>
      <p class="integ-more">{{ t('integ_more') }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  integrations: { type: Array, required: true },
  t:            { type: Function, required: true }
})
</script>