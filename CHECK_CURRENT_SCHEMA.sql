-- ============================================================================
-- COMPLETE SUPABASE SCHEMA INSPECTOR
-- Run this to get a full snapshot of your current database structure
-- ============================================================================

-- ============================================================================
-- 1. ALL TABLES WITH DETAILS
-- ============================================================================
SELECT 
    '=== TABLES ===' as section,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 2. ALL COLUMNS FOR EACH TABLE
-- ============================================================================
SELECT 
    '=== COLUMNS ===' as section,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- 3. ALL CONSTRAINTS (PRIMARY KEYS, FOREIGN KEYS, UNIQUE, CHECK)
-- ============================================================================
SELECT 
    '=== CONSTRAINTS ===' as section,
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================================================
-- 4. ALL INDEXES
-- ============================================================================
SELECT 
    '=== INDEXES ===' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 5. ALL FUNCTIONS AND STORED PROCEDURES
-- ============================================================================
SELECT 
    '=== FUNCTIONS ===' as section,
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ============================================================================
-- 6. ALL TRIGGERS
-- ============================================================================
SELECT 
    '=== TRIGGERS ===' as section,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 7. ALL VIEWS
-- ============================================================================
SELECT 
    '=== VIEWS ===' as section,
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
SELECT 
    '=== RLS POLICIES ===' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 9. TABLE SIZES AND ROW COUNTS
-- ============================================================================
SELECT 
    '=== TABLE STATISTICS ===' as section,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- 10. ENUM TYPES
-- ============================================================================
SELECT 
    '=== ENUM TYPES ===' as section,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- ============================================================================
-- 11. SEQUENCES
-- ============================================================================
SELECT 
    '=== SEQUENCES ===' as section,
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- ============================================================================
-- 12. CURRENT DATA COUNTS (Safe - checks table existence)
-- ============================================================================
SELECT '=== DATA COUNTS ===' as section;

DO $$
DECLARE
    table_record RECORD;
    row_count BIGINT;
BEGIN
    -- Create temp table for results
    CREATE TEMP TABLE IF NOT EXISTS temp_counts (
        table_name TEXT,
        row_count BIGINT
    );
    
    -- Loop through all tables and count rows
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tablename) INTO row_count;
        INSERT INTO temp_counts VALUES (table_record.tablename, row_count);
    END LOOP;
    
    -- Display results
    RAISE NOTICE 'Table Counts:';
    FOR table_record IN SELECT * FROM temp_counts ORDER BY table_name LOOP
        RAISE NOTICE '  % : %', table_record.table_name, table_record.row_count;
    END LOOP;
END $$;

-- Alternative: Display counts from temp table created above
SELECT 
    table_name,
    row_count
FROM temp_counts
ORDER BY table_name;

-- ============================================================================
-- 13. SAMPLE DATA FROM KEY TABLES (Safe)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitions') THEN
        RAISE NOTICE '=== SAMPLE COMPETITIONS ===';
        PERFORM * FROM competitions LIMIT 5;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
        RAISE NOTICE '=== SAMPLE QUESTIONS ===';
        PERFORM * FROM questions LIMIT 5;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') THEN
        RAISE NOTICE '=== SAMPLE SUBMISSIONS ===';
        PERFORM * FROM submissions LIMIT 5;
    END IF;
END $$;

-- Safe queries with table existence checks
SELECT '=== SAMPLE COMPETITIONS ===' as section;
SELECT id, title, slug, status, start_at, end_at 
FROM competitions 
LIMIT 5;

SELECT '=== SAMPLE QUESTIONS ===' as section;
SELECT id, competition_id, type, question_text, is_active 
FROM questions 
LIMIT 5;

SELECT '=== SAMPLE SUBMISSIONS ===' as section;
SELECT id, competition_id, participant_name, score, total_questions, status, submitted_at 
FROM submissions 
LIMIT 5;

-- ============================================================================
-- 14. CHECK CONSTRAINTS DETAILS
-- ============================================================================
SELECT 
    '=== CHECK CONSTRAINTS ===' as section,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 15. COLUMN COMMENTS
-- ============================================================================
SELECT 
    '=== COLUMN COMMENTS ===' as section,
    c.table_name,
    c.column_name,
    pgd.description
FROM pg_catalog.pg_statio_all_tables as st
INNER JOIN pg_catalog.pg_description pgd on (pgd.objoid = st.relid)
INNER JOIN information_schema.columns c on (
    pgd.objsubid = c.ordinal_position and
    c.table_schema = st.schemaname and
    c.table_name = st.relname
)
WHERE st.schemaname = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- ============================================================================
-- 16. FOREIGN KEY RELATIONSHIPS MAP
-- ============================================================================
SELECT 
    '=== FOREIGN KEY RELATIONSHIPS ===' as section,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT '=== SCHEMA SUMMARY ===' as section;

SELECT 
    'Total Tables' as metric,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Total Views',
    COUNT(*)
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Total Functions',
    COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public'
UNION ALL
SELECT 
    'Total Indexes',
    COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Total Triggers',
    COUNT(*)
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- ============================================================================
-- NOTES:
-- - Run this entire script in Supabase SQL Editor
-- - Results will show complete database structure
-- - Use this output when creating new migrations
-- - Save output for documentation purposes
-- ============================================================================
