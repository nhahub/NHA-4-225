CREATE TYPE "public"."day_state" AS ENUM('legendary', 'amazing', 'perfect', 'good_enough', 'low');--> statement-breakpoint
CREATE TYPE "public"."day_type" AS ENUM('work', 'light', 'off');--> statement-breakpoint
CREATE TYPE "public"."goal_category" AS ENUM('education_work', 'family', 'health', 'religion_spirituality', 'other');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'archived', 'replaced');--> statement-breakpoint
CREATE TYPE "public"."habit_type" AS ENUM('boolean', 'counter', 'quit');--> statement-breakpoint
CREATE TYPE "public"."task_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'completed', 'postponed');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('scheduled', 'flexible', 'quick');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"day_type" "day_type" DEFAULT 'work' NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"habits_completed" integer DEFAULT 0 NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"daily_target" integer DEFAULT 0 NOT NULL,
	"day_state" "day_state",
	"summary_shown" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uniq_user_daily_summary_date" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "goal_category" NOT NULL,
	"custom_category" text,
	"measure" text NOT NULL,
	"relevance" text,
	"cycle_start" date NOT NULL,
	"cycle_end" date NOT NULL,
	"manual_progress" integer,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"deletion_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"date" date NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"is_mvd" boolean DEFAULT false NOT NULL,
	"is_relapse" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uniq_habit_log_date" UNIQUE("habit_id","date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" "goal_category" NOT NULL,
	"type" "habit_type" DEFAULT 'boolean' NOT NULL,
	"frequency" jsonb NOT NULL,
	"target_value" integer,
	"mvd_value" integer,
	"mvd_description" text,
	"is_spiritual" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"type" "task_type" DEFAULT 'quick' NOT NULL,
	"difficulty" "task_difficulty" DEFAULT 'medium' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"date" date NOT NULL,
	"time_block_start" time,
	"time_block_end" time,
	"planned_duration_minutes" integer,
	"actual_duration_minutes" integer,
	"checklist" jsonb,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"settings" jsonb NOT NULL,
	"refresh_token" text,
	"refresh_token_exp" timestamp with time zone,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_user_created" ON "analytics_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_goals_user_status" ON "goals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_habit_logs_habit_date" ON "habit_logs" USING btree ("habit_id","date");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_date_priority" ON "tasks" USING btree ("user_id","date","priority");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_goal" ON "tasks" USING btree ("user_id","goal_id");