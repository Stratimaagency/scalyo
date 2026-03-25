<template>
  <div class="field-group">
    <label v-if="label" class="field-label">
      {{ label }}<span v-if="required" style="color: var(--red); margin-left: 2px">*</span>
    </label>
    <input
      v-if="type !== 'textarea'"
      :value="modelValue"
      @input="$emit('update:modelValue', type === 'number' ? (+$event.target.value || 0) : $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="field-input"
      @keydown.enter="$emit('enter')"
    />
    <textarea
      v-else
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="field-input"
      style="resize: vertical"
    ></textarea>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  rows: { type: Number, default: 3 },
})
defineEmits(['update:modelValue', 'enter'])
</script>
