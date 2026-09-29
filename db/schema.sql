-- Use a NEW database named forma-inquiries-v2; this is not a migration for the original schema.
CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY,
 reference TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 project_type TEXT NOT NULL,
 message TEXT NOT NULL,
 consent INTEGER NOT NULL CHECK(consent = 1),
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiries_created ON inquiries(created_at);
