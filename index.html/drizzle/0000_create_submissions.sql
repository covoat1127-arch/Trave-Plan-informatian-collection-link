CREATE TABLE `submissions` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `client_name` text NOT NULL,
  `contact` text NOT NULL,
  `departure` text NOT NULL,
  `destination` text NOT NULL,
  `start_date` text NOT NULL,
  `end_date` text NOT NULL,
  `payload_json` text NOT NULL,
  `consent` integer NOT NULL,
  `status` text DEFAULT 'new' NOT NULL
);
