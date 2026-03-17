<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="scalyo-icon" :class="'si-' + name">
    <!-- Dashboard / Bar Chart -->
    <template v-if="name === 'dashboard'">
      <rect x="2" y="2" width="20" height="20" rx="4" :fill="c.tealBg" />
      <rect x="5" y="11" width="3" height="8" rx="1.5" :fill="c.teal" />
      <rect x="10.5" y="7" width="3" height="12" rx="1.5" :fill="c.purple" />
      <rect x="16" y="4" width="3" height="15" rx="1.5" :fill="c.teal" opacity="0.6" />
    </template>

    <!-- Briefcase / Portfolio -->
    <template v-if="name === 'briefcase'">
      <rect x="2" y="7" width="20" height="14" rx="3" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
      <line x1="2" y1="13" x2="22" y2="13" :stroke="c.teal" stroke-width="1.5" opacity="0.4" />
      <circle cx="12" cy="13" r="2" :fill="c.teal" />
    </template>

    <!-- Chart Up / Trending -->
    <template v-if="name === 'chart-up'">
      <rect x="2" y="2" width="20" height="20" rx="4" :fill="c.greenBg" />
      <polyline points="4,17 9,11 13,14 20,6" :stroke="c.green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <polyline points="16,6 20,6 20,10" :stroke="c.green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- Calendar -->
    <template v-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="17" rx="3" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <line x1="3" y1="10" x2="21" y2="10" :stroke="c.teal" stroke-width="1.5" />
      <line x1="8" y1="2" x2="8" y2="6" :stroke="c.teal" stroke-width="2" stroke-linecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" :stroke="c.teal" stroke-width="2" stroke-linecap="round" />
      <circle cx="8" cy="15" r="1.5" :fill="c.purple" />
      <circle cx="12" cy="15" r="1.5" :fill="c.teal" />
      <circle cx="16" cy="15" r="1.5" :fill="c.teal" opacity="0.4" />
    </template>

    <!-- Check Circle -->
    <template v-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="10" :fill="c.greenBg" :stroke="c.green" stroke-width="1.5" />
      <polyline points="7,12 10.5,15.5 17,8.5" :stroke="c.green" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- Heart / Wellbeing -->
    <template v-if="name === 'heart'">
      <path d="M12 21s-7-4.35-9-8.5C1 8.5 3.5 4 7.5 4c2.54 0 3.97 1.73 4.5 2.73C12.53 5.73 13.96 4 16.5 4 20.5 4 23 8.5 21 12.5c-2 4.15-9 8.5-9 8.5z" :fill="c.green" />
      <path d="M12 21s-7-4.35-9-8.5C1 8.5 3.5 4 7.5 4c2.54 0 3.97 1.73 4.5 2.73" :fill="c.green" opacity="0.7" />
    </template>

    <!-- Robot / AI Coach -->
    <template v-if="name === 'robot'">
      <rect x="4" y="8" width="16" height="13" rx="3" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <circle cx="12" cy="5" r="2" :fill="c.purple" />
      <line x1="12" y1="7" x2="12" y2="8" :stroke="c.purple" stroke-width="1.5" />
      <circle cx="9" cy="13" r="2" :fill="c.teal" />
      <circle cx="15" cy="13" r="2" :fill="c.teal" />
      <path d="M9 17.5h6" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
      <line x1="2" y1="14" x2="4" y2="14" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
      <line x1="20" y1="14" x2="22" y2="14" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- Books / Resources -->
    <template v-if="name === 'books'">
      <rect x="3" y="3" width="5" height="18" rx="1" :fill="c.teal" />
      <rect x="9.5" y="5" width="5" height="16" rx="1" :fill="c.purple" />
      <rect x="16" y="2" width="5" height="19" rx="1" :fill="c.blue" />
      <line x1="3" y1="17" x2="8" y2="17" stroke="white" stroke-width="0.5" opacity="0.5" />
      <line x1="9.5" y1="17" x2="14.5" y2="17" stroke="white" stroke-width="0.5" opacity="0.5" />
      <line x1="16" y1="17" x2="21" y2="17" stroke="white" stroke-width="0.5" opacity="0.5" />
    </template>

    <!-- Envelope / Email -->
    <template v-if="name === 'envelope'">
      <rect x="2" y="5" width="20" height="14" rx="3" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <polyline points="2,5 12,13 22,5" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="2" y1="19" x2="8" y2="13" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
      <line x1="22" y1="19" x2="16" y2="13" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
    </template>

    <!-- Map / Roadmap -->
    <template v-if="name === 'map'">
      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" stroke-linejoin="round" />
      <line x1="9" y1="3" x2="9" y2="18" :stroke="c.teal" stroke-width="1.5" />
      <line x1="15" y1="6" x2="15" y2="21" :stroke="c.teal" stroke-width="1.5" />
      <circle cx="9" cy="10" r="2" :fill="c.red" />
    </template>

    <!-- Lightbulb / Tips -->
    <template v-if="name === 'lightbulb'">
      <path d="M12 2a7 7 0 00-3 13.33V17a1 1 0 001 1h4a1 1 0 001-1v-1.67A7 7 0 0012 2z" :fill="c.amberBg" :stroke="c.amber" stroke-width="1.5" />
      <line x1="10" y1="20" x2="14" y2="20" :stroke="c.amber" stroke-width="1.5" stroke-linecap="round" />
      <line x1="10.5" y1="22" x2="13.5" y2="22" :stroke="c.amber" stroke-width="1.5" stroke-linecap="round" />
      <line x1="12" y1="8" x2="12" y2="12" :stroke="c.amber" stroke-width="1.5" stroke-linecap="round" />
      <line x1="10" y1="10" x2="14" y2="10" :stroke="c.amber" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- Gear / Settings -->
    <template v-if="name === 'gear'">
      <circle cx="12" cy="12" r="3" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" :stroke="c.teal" stroke-width="2" stroke-linecap="round" />
    </template>

    <!-- Bolt / Lightning -->
    <template v-if="name === 'bolt'">
      <polygon points="13,2 4,14 11,14 10,22 20,10 13,10" :fill="c.teal" />
      <polygon points="13,2 4,14 11,14" :fill="c.teal" opacity="0.8" />
    </template>

    <!-- Money / Currency -->
    <template v-if="name === 'money'">
      <circle cx="12" cy="12" r="10" :fill="c.greenBg" :stroke="c.green" stroke-width="1.5" />
      <text x="12" y="16.5" text-anchor="middle" :fill="c.green" font-size="12" font-weight="800" font-family="'Plus Jakarta Sans', sans-serif">$</text>
    </template>

    <!-- Siren / Alert -->
    <template v-if="name === 'siren'">
      <circle cx="12" cy="12" r="10" :fill="c.redBg" />
      <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" :stroke="c.red" stroke-width="1.5" />
      <line x1="12" y1="7" x2="12" y2="13" :stroke="c.red" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="12" cy="16.5" r="1.5" :fill="c.red" />
    </template>

    <!-- Search / Magnifying glass -->
    <template v-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="6.5" :stroke="c.teal" stroke-width="2" fill="none" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" :stroke="c.teal" stroke-width="2.5" stroke-linecap="round" />
    </template>

    <!-- Upload -->
    <template v-if="name === 'upload'">
      <polyline points="7,11 12,6 17,11" :stroke="c.teal" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <line x1="12" y1="6" x2="12" y2="18" :stroke="c.teal" stroke-width="2" stroke-linecap="round" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" :stroke="c.teal" stroke-width="2" stroke-linecap="round" fill="none" />
    </template>

    <!-- Pencil / Edit -->
    <template v-if="name === 'pencil'">
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" stroke-linejoin="round" />
      <line x1="14" y1="6" x2="18" y2="10" :stroke="c.teal" stroke-width="1.5" />
    </template>

    <!-- Trash -->
    <template v-if="name === 'trash'">
      <polyline points="3,6 5,6 21,6" :stroke="c.red" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" :stroke="c.red" stroke-width="1.5" fill="none" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" :stroke="c.red" stroke-width="1.5" fill="none" />
    </template>

    <!-- Folder -->
    <template v-if="name === 'folder'">
      <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
    </template>

    <!-- Meditation / Zen -->
    <template v-if="name === 'meditation'">
      <circle cx="12" cy="5" r="3" :fill="c.purple" />
      <path d="M7 21c0-4 2-6 5-8 3 2 5 4 5 8" :stroke="c.purple" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M4 18c2-1 4-1 5 0" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M15 18c1-1 3-1 5 0" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" fill="none" />
    </template>

    <!-- People / Team -->
    <template v-if="name === 'people'">
      <circle cx="8" cy="7" r="3" :fill="c.teal" />
      <circle cx="16" cy="7" r="3" :fill="c.purple" />
      <path d="M2 20c0-3 2.5-5 6-5s6 2 6 5" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <path d="M14 15c1.5 0 3 0.5 4.5 1.5C20 17.5 20.5 19 20.5 20" :stroke="c.purple" stroke-width="1.5" stroke-linecap="round" fill="none" />
    </template>

    <!-- Fire / Burnout -->
    <template v-if="name === 'fire'">
      <path d="M12 22c4.5 0 7-3 7-7 0-3-2-5.5-4-7.5-.5-.5-1 .5-1 1 0-4-3-6.5-5-8.5 0 3-3 5.5-5 8C2 11.5 5 22 12 22z" :fill="c.amber" />
      <path d="M12 22c2.5 0 4-1.5 4-4 0-1.5-1-3-2-4-.3-.3-.5.3-.5.5 0-2-1.5-3.5-2.5-4.5 0 1.5-1.5 3-2.5 4.5C7.5 17 9.5 22 12 22z" :fill="c.red" />
    </template>

    <!-- Trophy -->
    <template v-if="name === 'trophy'">
      <path d="M8 21h8M12 17v4M6 3h12v5a6 6 0 01-12 0V3z" :fill="c.amberBg" :stroke="c.amber" stroke-width="1.5" />
      <path d="M6 4H4a1 1 0 00-1 1v1a3 3 0 003 3M18 4h2a1 1 0 011 1v1a3 3 0 01-3 3" :stroke="c.amber" stroke-width="1.5" fill="none" />
      <circle cx="12" cy="8" r="1.5" :fill="c.amber" />
    </template>

    <!-- Handshake -->
    <template v-if="name === 'handshake'">
      <path d="M2 11l4-4 4 2 4-4 4 2 4-2" :stroke="c.teal" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M6 17l3 3 3-3 3 3 3-3" :stroke="c.purple" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <line x1="2" y1="11" x2="2" y2="17" :stroke="c.teal" stroke-width="2" stroke-linecap="round" />
      <line x1="22" y1="5" x2="22" y2="11" :stroke="c.teal" stroke-width="2" stroke-linecap="round" />
    </template>

    <!-- Brain -->
    <template v-if="name === 'brain'">
      <path d="M12 2C8 2 5 5 5 8c0 1.5.5 2.8 1.3 4C5.5 13.5 5 15 5 17c0 3 2.5 5 5.5 5h3c3 0 5.5-2 5.5-5 0-2-.5-3.5-1.3-5 .8-1.2 1.3-2.5 1.3-4 0-3-3-6-7-6z" :fill="c.purpleBg" :stroke="c.purple" stroke-width="1.5" />
      <line x1="12" y1="2" x2="12" y2="22" :stroke="c.purple" stroke-width="1" opacity="0.4" />
      <path d="M8 8c1 0 2 1 4 1M8 13c1.5 0 2.5 1 4 1M16 8c-1 0-2 1-4 1M16 13c-1.5 0-2.5 1-4 1" :stroke="c.purple" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5" />
    </template>

    <!-- Star Glow -->
    <template v-if="name === 'star-glow'">
      <circle cx="12" cy="12" r="10" :fill="c.amberBg" />
      <polygon points="12,3 14.5,9 21,9.5 16,14 17.5,21 12,17.5 6.5,21 8,14 3,9.5 9.5,9" :fill="c.amber" />
    </template>

    <!-- Target / Crosshair -->
    <template v-if="name === 'target'">
      <circle cx="12" cy="12" r="10" :stroke="c.red" stroke-width="1.5" :fill="c.redBg" />
      <circle cx="12" cy="12" r="6" :stroke="c.red" stroke-width="1.5" fill="none" />
      <circle cx="12" cy="12" r="2.5" :fill="c.red" />
    </template>

    <!-- Chat / Speech bubble -->
    <template v-if="name === 'chat'">
      <path d="M21 12c0 4.5-4 8-9 8-1.5 0-2.9-.3-4.2-.8L3 21l1.8-4.2C3.7 15.2 3 13.7 3 12c0-4.5 4-8 9-8s9 3.5 9 8z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <circle cx="8.5" cy="12" r="1" :fill="c.teal" />
      <circle cx="12" cy="12" r="1" :fill="c.teal" />
      <circle cx="15.5" cy="12" r="1" :fill="c.teal" />
    </template>

    <!-- Bug -->
    <template v-if="name === 'bug'">
      <ellipse cx="12" cy="14" rx="5" ry="7" :fill="c.redBg" :stroke="c.red" stroke-width="1.5" />
      <line x1="12" y1="7" x2="12" y2="21" :stroke="c.red" stroke-width="1" opacity="0.3" />
      <circle cx="10" cy="11" r="1" :fill="c.red" />
      <circle cx="14" cy="11" r="1" :fill="c.red" />
      <path d="M5 10l-2-2M19 10l2-2M4 14H2M22 14h-2M5 18l-2 2M19 18l2 2" :stroke="c.red" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- Party / Celebration -->
    <template v-if="name === 'party'">
      <path d="M4 21L8 7l10 10L4 21z" :fill="c.amberBg" :stroke="c.amber" stroke-width="1.5" />
      <circle cx="16" cy="4" r="1.5" :fill="c.purple" />
      <circle cx="20" cy="8" r="1" :fill="c.teal" />
      <circle cx="19" cy="3" r="1" :fill="c.red" />
      <path d="M13 3l1 2M20 11l2 1M17 6l2-1" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- Clipboard -->
    <template v-if="name === 'clipboard'">
      <rect x="4" y="3" width="16" height="18" rx="2" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <rect x="8" y="1" width="8" height="4" rx="1" :fill="c.teal" />
      <line x1="8" y1="10" x2="16" y2="10" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
      <line x1="8" y1="14" x2="14" y2="14" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
      <line x1="8" y1="18" x2="12" y2="18" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
    </template>

    <!-- Book Open -->
    <template v-if="name === 'book-open'">
      <path d="M2 4c2-1 4.5-1 7 0l3 1.5L15 4c2.5-1 5-1 7 0v15c-2-1-4.5-1-7 0l-3 1.5L9 19c-2.5-1-5-1-7 0V4z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <line x1="12" y1="5.5" x2="12" y2="20.5" :stroke="c.teal" stroke-width="1" opacity="0.4" />
    </template>

    <!-- Memo / Note -->
    <template v-if="name === 'memo'">
      <rect x="4" y="2" width="16" height="20" rx="2" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <line x1="8" y1="7" x2="16" y2="7" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
      <line x1="8" y1="11" x2="16" y2="11" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
      <line x1="8" y1="15" x2="13" y2="15" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
      <path d="M14 18l4 4v-4h-4z" :fill="c.teal" opacity="0.2" />
    </template>

    <!-- Refresh / Cycle -->
    <template v-if="name === 'refresh'">
      <path d="M21 3v6h-6" :stroke="c.teal" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M3 21v-6h6" :stroke="c.teal" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M3 12a9 9 0 0115.35-6.35L21 9M3 15l2.65 3.35A9 9 0 0021 12" :stroke="c.teal" stroke-width="2" stroke-linecap="round" fill="none" />
    </template>

    <!-- Warning -->
    <template v-if="name === 'warning'">
      <path d="M12 2L2 20h20L12 2z" :fill="c.amberBg" :stroke="c.amber" stroke-width="1.5" stroke-linejoin="round" />
      <line x1="12" y1="9" x2="12" y2="14" :stroke="c.amber" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="12" cy="17" r="1.3" :fill="c.amber" />
    </template>

    <!-- Email (alternate) -->
    <template v-if="name === 'email-alt'">
      <rect x="2" y="5" width="20" height="14" rx="3" :fill="c.blueBg" :stroke="c.blue" stroke-width="1.5" />
      <polyline points="2,5 12,13 22,5" :stroke="c.blue" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- Building / Construction -->
    <template v-if="name === 'building'">
      <rect x="4" y="6" width="16" height="16" rx="1" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <rect x="8" y="2" width="8" height="4" rx="1" :fill="c.teal" />
      <rect x="7" y="10" width="3" height="3" rx="0.5" :fill="c.teal" opacity="0.5" />
      <rect x="14" y="10" width="3" height="3" rx="0.5" :fill="c.teal" opacity="0.5" />
      <rect x="10" y="16" width="4" height="6" rx="0.5" :fill="c.teal" />
    </template>

    <!-- Star -->
    <template v-if="name === 'star'">
      <polygon points="12,2 14.9,8.6 22,9.3 16.8,13.8 18.2,21 12,17.3 5.8,21 7.2,13.8 2,9.3 9.1,8.6" :fill="c.amber" :stroke="c.amber" stroke-width="1" />
    </template>

    <!-- Power -->
    <template v-if="name === 'power'">
      <circle cx="12" cy="12" r="9" :stroke="c.red" stroke-width="1.5" fill="none" />
      <line x1="12" y1="3" x2="12" y2="12" :stroke="c.red" stroke-width="2.5" stroke-linecap="round" />
    </template>

    <!-- Mailbox / Empty -->
    <template v-if="name === 'mailbox'">
      <rect x="4" y="4" width="16" height="12" rx="2" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <path d="M4 16h16v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <line x1="12" y1="1" x2="12" y2="4" :stroke="c.teal" stroke-width="1.5" stroke-linecap="round" />
      <polyline points="9,1.5 12,1 15,1.5" :stroke="c.teal" stroke-width="1" stroke-linecap="round" fill="none" />
    </template>

    <!-- Rocket -->
    <template v-if="name === 'rocket'">
      <path d="M12 2C8 6 6 10 6 14l3 3 6 0 3-3c0-4-2-8-6-12z" :fill="c.tealBg" :stroke="c.teal" stroke-width="1.5" />
      <circle cx="12" cy="11" r="2" :fill="c.teal" />
      <path d="M6 14l-3 3 3 1M18 14l3 3-3 1" :stroke="c.purple" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M9 20l1 2h4l1-2" :stroke="c.red" stroke-width="1.5" stroke-linecap="round" fill="none" />
    </template>

    <!-- Wave / Hand -->
    <template v-if="name === 'wave'">
      <path d="M7 15c-1-2-1.5-4-1-6s2-3 3.5-2.5c.5.2.8.5 1 .8.5-1.5 1.5-2 3-1.5.5.2.9.5 1.1.9.5-1 1.5-1.5 2.5-1 1 .5 1.5 1.5 1.5 2.5.5-.5 1.5-.5 2.2.2s1 2 .5 3.5l-2 5c-.5 1.5-2 2.5-3.5 2.5H11c-2 0-3.5-1-4.5-3L7 15z" :fill="c.amberBg" :stroke="c.amber" stroke-width="1.5" />
    </template>

    <!-- Check (simple) -->
    <template v-if="name === 'check'">
      <polyline points="4,12 9,17 20,6" :stroke="c.green" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- Close / X -->
    <template v-if="name === 'close'">
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </template>

    <!-- Square (empty checkbox) -->
    <template v-if="name === 'square'">
      <rect x="3" y="3" width="18" height="18" rx="3" :stroke="c.teal" stroke-width="1.5" fill="none" opacity="0.4" />
    </template>

    <!-- Colored dots -->
    <template v-if="name === 'dot-green'">
      <circle cx="12" cy="12" r="7" :fill="c.green" />
      <circle cx="12" cy="12" r="10" :fill="c.green" opacity="0.15" />
    </template>
    <template v-if="name === 'dot-red'">
      <circle cx="12" cy="12" r="7" :fill="c.red" />
      <circle cx="12" cy="12" r="10" :fill="c.red" opacity="0.15" />
    </template>
    <template v-if="name === 'dot-yellow'">
      <circle cx="12" cy="12" r="7" :fill="c.amber" />
      <circle cx="12" cy="12" r="10" :fill="c.amber" opacity="0.15" />
    </template>
    <template v-if="name === 'dot-orange'">
      <circle cx="12" cy="12" r="7" fill="#E8943A" />
      <circle cx="12" cy="12" r="10" fill="#E8943A" opacity="0.15" />
    </template>
    <template v-if="name === 'dot-blue'">
      <circle cx="12" cy="12" r="7" :fill="c.blue" />
      <circle cx="12" cy="12" r="10" :fill="c.blue" opacity="0.15" />
    </template>

    <!-- NPS/Survey chart -->
    <template v-if="name === 'survey'">
      <rect x="2" y="2" width="20" height="20" rx="4" :fill="c.blueBg" />
      <rect x="5" y="12" width="3.5" height="7" rx="1" :fill="c.blue" />
      <rect x="10.25" y="8" width="3.5" height="11" rx="1" :fill="c.blue" opacity="0.7" />
      <rect x="15.5" y="5" width="3.5" height="14" rx="1" :fill="c.blue" opacity="0.5" />
    </template>
  </svg>
</template>

<script setup>
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
})

// Colors reference CSS variables for theme support
const c = {
  teal: 'var(--teal)',
  tealBg: 'var(--tealBg)',
  red: 'var(--red)',
  redBg: 'var(--redBg)',
  amber: 'var(--amber)',
  amberBg: 'var(--amberBg, rgba(212,186,110,0.12))',
  green: 'var(--green)',
  greenBg: 'var(--greenBg, rgba(155,184,168,0.12))',
  purple: 'var(--purple)',
  purpleBg: 'var(--purpleBg, rgba(184,168,212,0.12))',
  blue: 'var(--blue)',
  blueBg: 'var(--blueBg, rgba(139,168,196,0.12))',
}
</script>

<style scoped>
.scalyo-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
