// DAISYDOG V7.0.0 - REPLIT POSTGRESQL SCHEMA
// Migrated from Supabase + Parent Dashboard Tables
// COPPA Compliant - Privacy-First Child Protection Database

import { pgTable, uuid, timestamp, text, integer, boolean, jsonb, serial, varchar, date, time, check } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ===== PARENT ACCOUNT TABLES (NEW) =====

export const parents = pgTable('parents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('free').notNull(), // 'free', 'active', 'past_due', 'cancelled'
  subscriptionTier: varchar('subscription_tier', { length: 50 }), // 'monthly', 'annual'
  subscriptionStartedAt: timestamp('subscription_started_at', { withTimezone: true }),
  subscriptionEndsAt: timestamp('subscription_ends_at', { withTimezone: true }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const children = pgTable('children', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  parentId: uuid('parent_id').references(() => parents.id, { onDelete: 'cascade' }).notNull(),
  nickname: varchar('nickname', { length: 50 }).notNull(),
  ageRange: varchar('age_range', { length: 20 }).notNull(), // '4-7', '8-12', '13-16'
  avatarColor: varchar('avatar_color', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const childLinkCodes = pgTable('child_link_codes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: uuid('child_id').references(() => children.id, { onDelete: 'cascade' }).notNull(),
  code: varchar('code', { length: 6 }).unique().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // 3 days from creation
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const parentSettings = pgTable('parent_settings', {
  parentId: uuid('parent_id').primaryKey().references(() => parents.id, { onDelete: 'cascade' }),
  emailReportsEnabled: boolean('email_reports_enabled').default(true).notNull(),
  safetyAlertsEnabled: boolean('safety_alerts_enabled').default(true).notNull(),
  contentFilterLevel: varchar('content_filter_level', { length: 20 }).default('moderate').notNull(), // 'relaxed', 'moderate', 'strict'
  dailyTimeLimitMinutes: integer('daily_time_limit_minutes'),
  bedtimeStart: time('bedtime_start'),
  bedtimeEnd: time('bedtime_end'),
  allowedFeatures: jsonb('allowed_features').default({ games: true, chat: true, prayers: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const parentReports = pgTable('parent_reports', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  parentId: uuid('parent_id').references(() => parents.id, { onDelete: 'cascade' }).notNull(),
  childId: uuid('child_id').references(() => children.id, { onDelete: 'cascade' }),
  reportWeekStart: date('report_week_start').notNull(),
  reportData: jsonb('report_data').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ===== CORE TABLES (MIGRATED FROM SUPABASE) =====

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: uuid('child_id').references(() => children.id, { onDelete: 'set null' }), // Link to child account (NULL for free users)
  isLinkedAccount: boolean('is_linked_account').default(false).notNull(),
  ageRange: varchar('age_range', { length: 20 }), // '8-12', '13-16', '17+'
  sessionDuration: integer('session_duration').default(0).notNull(),
  interactionsCount: integer('interactions_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastActivity: timestamp('last_activity', { withTimezone: true }).defaultNow().notNull(),
});

export const safetyEvents = pgTable('safety_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'drug_safety', 'comprehensive_safety', 'false_positive'
  category: varchar('category', { length: 50 }),
  keywordMatched: text('keyword_matched'),
  ageRange: varchar('age_range', { length: 20 }),
  wasHelpful: boolean('was_helpful'),
  parentReviewed: boolean('parent_reviewed').default(false).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

export const performanceLogs = pgTable('performance_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  metricName: varchar('metric_name', { length: 100 }).notNull(),
  metricValue: integer('metric_value').notNull(),
  success: boolean('success').default(true).notNull(),
  errorType: varchar('error_type', { length: 100 }),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

export const featureAnalytics = pgTable('feature_analytics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  featureName: varchar('feature_name', { length: 100 }).notNull(),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  durationSeconds: integer('duration_seconds'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

export const contentCache = pgTable('content_cache', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: varchar('cache_key', { length: 255 }).unique().notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  contentData: jsonb('content_data').notNull(),
  accessCount: integer('access_count').default(0).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastAccessed: timestamp('last_accessed', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const systemReports = pgTable('system_reports', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  reportDate: date('report_date').notNull(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // 'daily', 'weekly', 'monthly'
  metrics: jsonb('metrics').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ===== EDUCATIONAL CONTENT TABLES =====

export const historicalEvents = pgTable('historical_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  year: integer('year').notNull(),
  dateDisplay: varchar('date_display', { length: 100 }),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description'),
  kidFriendlySummary: text('kid_friendly_summary').notNull(),
  significance: text('significance'),
  relatedPresidents: jsonb('related_presidents'),
  imageUrl: varchar('image_url', { length: 500 }),
  category: varchar('category', { length: 50 }),
  ageAppropriateMin: integer('age_appropriate_min').default(8).notNull(),
  ageAppropriateMax: integer('age_appropriate_max').default(18).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const presidents = pgTable('presidents', {
  id: serial('id').primaryKey(),
  number: integer('number').unique().notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  birthYear: integer('birth_year'),
  deathYear: integer('death_year'),
  party: varchar('party', { length: 100 }),
  termStart: integer('term_start').notNull(),
  termEnd: integer('term_end'),
  vicePresidents: jsonb('vice_presidents'),
  majorAccomplishments: jsonb('major_accomplishments'),
  kidFriendlySummary: text('kid_friendly_summary').notNull(),
  funFacts: jsonb('fun_facts'),
  portraitUrl: varchar('portrait_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ===== RELATIONS =====

export const parentsRelations = relations(parents, ({ many, one }) => ({
  children: many(children),
  settings: one(parentSettings, {
    fields: [parents.id],
    references: [parentSettings.parentId],
  }),
  reports: many(parentReports),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(parents, {
    fields: [children.parentId],
    references: [parents.id],
  }),
  sessions: many(sessions),
  linkCodes: many(childLinkCodes),
  reports: many(parentReports),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  child: one(children, {
    fields: [sessions.childId],
    references: [children.id],
  }),
  safetyEvents: many(safetyEvents),
  performanceLogs: many(performanceLogs),
  featureAnalytics: many(featureAnalytics),
}));

export const safetyEventsRelations = relations(safetyEvents, ({ one }) => ({
  session: one(sessions, {
    fields: [safetyEvents.sessionId],
    references: [sessions.id],
  }),
}));

export const childLinkCodesRelations = relations(childLinkCodes, ({ one }) => ({
  child: one(children, {
    fields: [childLinkCodes.childId],
    references: [children.id],
  }),
}));

export const parentSettingsRelations = relations(parentSettings, ({ one }) => ({
  parent: one(parents, {
    fields: [parentSettings.parentId],
    references: [parents.id],
  }),
}));

export const parentReportsRelations = relations(parentReports, ({ one }) => ({
  parent: one(parents, {
    fields: [parentReports.parentId],
    references: [parents.id],
  }),
  child: one(children, {
    fields: [parentReports.childId],
    references: [children.id],
  }),
}));

// ===== TYPE EXPORTS =====

export type Parent = typeof parents.$inferSelect;
export type InsertParent = typeof parents.$inferInsert;

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type SafetyEvent = typeof safetyEvents.$inferSelect;
export type InsertSafetyEvent = typeof safetyEvents.$inferInsert;

export type PerformanceLog = typeof performanceLogs.$inferSelect;
export type InsertPerformanceLog = typeof performanceLogs.$inferInsert;

export type FeatureAnalytic = typeof featureAnalytics.$inferSelect;
export type InsertFeatureAnalytic = typeof featureAnalytics.$inferInsert;

export type ParentSettings = typeof parentSettings.$inferSelect;
export type InsertParentSettings = typeof parentSettings.$inferInsert;

export type ChildLinkCode = typeof childLinkCodes.$inferSelect;
export type InsertChildLinkCode = typeof childLinkCodes.$inferInsert;

export type ParentReport = typeof parentReports.$inferSelect;
export type InsertParentReport = typeof parentReports.$inferInsert;
