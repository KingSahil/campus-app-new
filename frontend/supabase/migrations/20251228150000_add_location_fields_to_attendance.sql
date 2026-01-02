-- Add location tracking fields to attendance_records table
-- This allows tracking distance from campus and GPS accuracy for attendance verification

ALTER TABLE attendance_records
ADD COLUMN IF NOT EXISTS distance_from_campus numeric,
ADD COLUMN IF NOT EXISTS gps_accuracy numeric,
ADD COLUMN IF NOT EXISTS location_verified boolean DEFAULT false;

-- Add indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_attendance_records_location_verified 
  ON attendance_records(location_verified);

COMMENT ON COLUMN attendance_records.distance_from_campus IS 'Distance from campus center in meters';
COMMENT ON COLUMN attendance_records.gps_accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN attendance_records.location_verified IS 'Whether the location was verified to be within campus range';
