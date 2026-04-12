<template>
  <svg :width="size" :height="size" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient :id="gid" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#FF6B6B"/>
        <stop offset="40%" stop-color="#FFC300"/>
        <stop offset="80%" stop-color="#6A82FB"/>
        <stop offset="100%" stop-color="#FC5C7D"/>
      </radialGradient>
    </defs>
    <circle cx="150" cy="150" r="145" :fill="`url(#${gid})`"/>
    <text x="150" y="205" font-family="Georgia,serif" font-size="185" font-weight="700" fill="#FFF" text-anchor="middle">S</text>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number, String], default: 36 } })
const gid = 'sg' + Math.random().toString(36).slice(2, 6)
</script>
