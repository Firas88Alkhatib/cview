<script setup lang="ts">
import { Document, Link, Page, Text, View } from '@ceereals/vue-pdf'
import type { Style } from '@ceereals/vue-pdf'
import { resolveFontFamily } from '~/pdf/meta'
import { formatPeriod, joinParts } from '~/pdf/shared/format'
import type { TemplateProps } from '~/pdf/registry'

// Placeholder template (P1-T09): proves the contract end to end. Pure: props in, PDF out.
const props = defineProps<TemplateProps>()

const profile = computed(() => props.data.profile)
const fullName = computed(() => `${profile.value.firstName} ${profile.value.lastName}`)
const contact = computed(() =>
  joinParts([
    profile.value.email,
    profile.value.phone,
    joinParts([profile.value.address?.city, profile.value.address?.country], ', '),
  ]),
)

const styles = computed(() => {
  const { colors } = props.theme
  return {
    page: {
      padding: 40,
      fontFamily: resolveFontFamily(props.theme.font),
      fontSize: 10,
      lineHeight: 1.4,
      color: colors.text,
      backgroundColor: colors.background,
    },
    name: { fontSize: 22, fontWeight: 700, color: colors.primary },
    title: { fontSize: 12, marginTop: 2 },
    contact: { fontSize: 9, marginTop: 6 },
    section: { marginTop: 16 },
    heading: {
      fontSize: 11,
      fontWeight: 700,
      color: colors.primary,
      textTransform: 'uppercase',
      borderBottom: `1pt solid ${colors.primary}`,
      paddingBottom: 2,
      marginBottom: 6,
    },
    entry: { marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    strong: { fontWeight: 700 },
    muted: { fontSize: 9, fontStyle: 'italic' },
  } satisfies Record<string, Style>
})
</script>

<template>
  <Document :title="fullName" :author="fullName" :language="props.locale">
    <Page size="A4" :style="styles.page">
      <View>
        <Text :style="styles.name">{{ fullName }}</Text>
        <Text v-if="profile.title" :style="styles.title">{{ profile.title }}</Text>
        <Text v-if="contact" :style="styles.contact">{{ contact }}</Text>
      </View>

      <View v-if="profile.summary" :style="styles.section">
        <Text :style="styles.heading">{{ props.labels.sections.summary }}</Text>
        <Text>{{ profile.summary }}</Text>
      </View>

      <View v-if="props.data.experience.length" :style="styles.section">
        <Text :style="styles.heading">{{ props.labels.sections.experience }}</Text>
        <View
          v-for="job in props.data.experience"
          :key="job.id"
          :style="styles.entry"
          :wrap="false"
        >
          <View :style="styles.row">
            <Text :style="styles.strong">{{ job.role }} · {{ job.company }}</Text>
            <Text>{{ formatPeriod(job.period, props.locale, props.labels) }}</Text>
          </View>
          <Text v-if="job.location || job.workModel" :style="styles.muted">
            {{ joinParts([job.location, job.workModel && props.labels.workModel[job.workModel]]) }}
          </Text>
          <Text v-if="job.description">{{ job.description }}</Text>
          <Text v-for="project in job.projects" :key="project.id">
            <Text :style="styles.strong">{{ project.name }}</Text>
            <Text v-if="project.description">: {{ project.description }}</Text>
          </Text>
        </View>
      </View>

      <View v-if="props.data.education.length" :style="styles.section">
        <Text :style="styles.heading">{{ props.labels.sections.education }}</Text>
        <View v-for="school in props.data.education" :key="school.id" :style="styles.entry">
          <View :style="styles.row">
            <Text :style="styles.strong">{{ joinParts([school.degree, school.major], ', ') }}</Text>
            <Text>{{ formatPeriod(school.period, props.locale, props.labels) }}</Text>
          </View>
          <Text>{{ school.institution }}</Text>
        </View>
      </View>

      <View v-if="props.data.skills.length" :style="styles.section">
        <Text :style="styles.heading">{{ props.labels.sections.skills }}</Text>
        <Text>{{ joinParts(props.data.skills.map((s) => s.name)) }}</Text>
      </View>

      <View v-if="props.data.languages.length" :style="styles.section">
        <Text :style="styles.heading">{{ props.labels.sections.languages }}</Text>
        <Text>
          {{
            joinParts(
              props.data.languages.map((l) => `${l.name} (${props.labels.languageLevel[l.level]})`),
            )
          }}
        </Text>
      </View>

      <View v-if="profile.links.length" :style="styles.section">
        <Text :style="styles.heading">{{ props.labels.sections.links }}</Text>
        <Link v-for="link in profile.links" :key="link.id" :src="link.url">
          {{ link.label }}: {{ link.url }}
        </Link>
      </View>
    </Page>
  </Document>
</template>
