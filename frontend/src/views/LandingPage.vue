<template>
  <div class="landing">
    <!-- Hero -->
    <header class="hero">
      <nav class="landing-nav">
        <div style="display: flex; align-items: center; gap: 10px">
          <div class="logo-icon" style="width: 36px; height: 36px; font-size: 18px">⚡</div>
          <span style="font-size: 20px; font-weight: 900; background: linear-gradient(135deg, var(--teal), var(--blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent">Scalyo</span>
        </div>
        <router-link to="/login" class="btn btn-primary">Get Started</router-link>
      </nav>

      <div class="hero-content">
        <h1 class="hero-title">Customer Success Platform</h1>
        <p class="hero-subtitle">Pilotez votre équipe CS. Réduisez le churn. Développez l'ARR.</p>
        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 32px">
          <router-link to="/login" class="btn btn-primary" style="padding: 14px 32px; font-size: 15px">
            Start Free →
          </router-link>
        </div>
        <p style="color: var(--muted); font-size: 13px; margin-top: 12px">No credit card required</p>
      </div>
    </header>

    <!-- Features -->
    <section class="features-section">
      <h2 style="font-size: 28px; font-weight: 900; text-align: center; margin-bottom: 40px; letter-spacing: -0.5px">
        Everything your CS team needs
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto">
        <div v-for="f in features" :key="f.icon" class="card card-lift" style="padding: 24px; text-align: center">
          <div style="font-size: 36px; margin-bottom: 12px">{{ f.icon }}</div>
          <div style="font-weight: 800; font-size: 16px; margin-bottom: 6px">{{ f.title }}</div>
          <div style="font-size: 13px; color: var(--muted); line-height: 1.6">{{ f.desc }}</div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="pricing-section">
      <h2 style="font-size: 28px; font-weight: 900; text-align: center; margin-bottom: 12px; letter-spacing: -0.5px">
        Choose your plan
      </h2>
      <p style="text-align: center; color: var(--muted); font-size: 14px; margin-bottom: 40px">
        CS teams that perform, clients that stay.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto">
        <div v-for="plan in plans" :key="plan.name" class="card card-lift" :style="{ borderColor: plan.highlight ? 'var(--tealBorder)' : '' }" style="padding: 28px; text-align: center">
          <div style="font-weight: 800; font-size: 18px; margin-bottom: 4px">{{ plan.name }}</div>
          <div style="font-size: 32px; font-weight: 900; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; color: var(--teal)">
            {{ plan.price }}
          </div>
          <div style="font-size: 13px; color: var(--muted); margin-bottom: 16px">/month</div>
          <ul style="list-style: none; font-size: 13px; text-align: left; margin-bottom: 20px">
            <li v-for="f in plan.features" :key="f" style="padding: 5px 0; color: var(--muted)">✓ {{ f }}</li>
          </ul>
          <router-link to="/login" class="btn" :class="plan.highlight ? 'btn-primary' : 'btn-secondary'" style="width: 100%; justify-content: center">
            {{ plan.highlight ? 'Start now' : 'Get started' }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer style="text-align: center; padding: 40px 20px; color: var(--muted); font-size: 13px; border-top: 1px solid var(--border)">
      <p>Scalyo — Customer Success Platform</p>
      <p style="margin-top: 4px">Cancel anytime · Secure billing via Stripe · Data hosted in Europe · GDPR</p>
    </footer>
  </div>
</template>

<script setup>
const features = [
  { icon: '📊', title: 'Dashboard & Analytics', desc: 'Real-time portfolio overview, health scores, and critical account alerts.' },
  { icon: '💼', title: 'Portfolio Management', desc: 'Track all accounts, CSM assignments, risk levels, and ARR in one place.' },
  { icon: '📈', title: 'KPI Tracking', desc: 'Standard and custom KPIs with goals, trends, and quarterly reporting.' },
  { icon: '📅', title: 'Planning & Calendar', desc: 'Week and month views with client events and calendar sync.' },
  { icon: '✅', title: 'Task Board', desc: 'Eisenhower matrix with drag-and-drop, due dates, and account linking.' },
  { icon: '💚', title: 'Team Wellbeing', desc: 'Monitor team health, burnout risk, and workload balance.' },
  { icon: '🤖', title: 'AI Coach', desc: 'Expert CS guidance powered by AI for strategy and best practices.' },
  { icon: '✉️', title: 'Email Studio', desc: 'Pre-built email templates for onboarding, QBR, renewals, and more.' },
  { icon: '📚', title: 'Resources & Tips', desc: 'Frameworks, playbooks, and best practices for CS managers and CSMs.' },
]

const plans = [
  { name: 'Starter', price: '0€', features: ['5 client accounts', 'Dashboard & KPIs', 'Task Board', 'Email Studio'], highlight: false },
  { name: 'Growth', price: '49€', features: ['Unlimited accounts', 'Unlimited CSMs', 'AI Coach', 'Team wellbeing', 'Planning'], highlight: true },
  { name: 'Elite', price: '149€', features: ['Everything in Growth', 'Dedicated onboarding', 'Priority support', 'Monthly coaching'], highlight: false },
]
</script>

<style scoped>
.landing { min-height: 100vh; }
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  max-width: 1200px;
  margin: 0 auto;
}
.hero {
  padding-bottom: 80px;
  background: radial-gradient(ellipse at top, var(--tealGlow) 0%, transparent 50%);
}
.hero-content {
  text-align: center;
  padding: 80px 20px 40px;
  max-width: 700px;
  margin: 0 auto;
}
.hero-title {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--text) 0%, var(--teal) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-subtitle {
  font-size: 18px;
  color: var(--muted);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}
.features-section { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
.pricing-section { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
@media (max-width: 768px) {
  .hero-title { font-size: 32px; }
  .hero-subtitle { font-size: 15px; }
  .landing-nav { padding: 12px 16px; }
}
</style>
