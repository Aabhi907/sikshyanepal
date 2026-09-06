-- Structured, optional signals from moderated student reviews.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS attendance_rating SMALLINT CHECK (attendance_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS safety_rating SMALLINT CHECK (safety_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS internship_support_rating SMALLINT CHECK (internship_support_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS hidden_costs_reported BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hostel_transport_note TEXT;
COMMENT ON COLUMN reviews.hidden_costs_reported IS 'Student-reported signal, visible only after moderation; never treated as a verified institutional fact.';
