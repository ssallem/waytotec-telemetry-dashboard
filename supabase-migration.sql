-- Supabase 스키마 마이그레이션
-- machine_name, ip_address 컬럼 추가

-- 1. machine_name 컬럼 추가
ALTER TABLE telemetry_events
ADD COLUMN IF NOT EXISTS machine_name TEXT;

-- 2. ip_address 컬럼 추가
ALTER TABLE telemetry_events
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 3. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_telemetry_machine_name
ON telemetry_events(machine_name);

CREATE INDEX IF NOT EXISTS idx_telemetry_ip_address
ON telemetry_events(ip_address);

-- 참고: 이 마이그레이션은 Supabase 콘솔의 SQL Editor에서 실행하세요.
-- https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql
