CREATE TABLE `diagrams` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Sem título' NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`thumbnail` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `document_folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `document_folders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `document_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`content_text` text DEFAULT '' NOT NULL,
	`page_number` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text,
	`file_path` text NOT NULL,
	`original_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`reading_status` text DEFAULT 'unread' NOT NULL,
	`extracted_text` text,
	`folder_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `document_folders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `links` (
	`source_id` text NOT NULL,
	`source_type` text NOT NULL,
	`target_id` text NOT NULL,
	`target_type` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`source_id`, `source_type`, `target_id`, `target_type`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Sem título' NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`content_text` text DEFAULT '' NOT NULL,
	`parent_id` text,
	`is_folder` integer DEFAULT false NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `taggables` (
	`tag_id` text NOT NULL,
	`taggable_id` text NOT NULL,
	`taggable_type` text NOT NULL,
	PRIMARY KEY(`tag_id`, `taggable_id`, `taggable_type`),
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#6366f1' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
