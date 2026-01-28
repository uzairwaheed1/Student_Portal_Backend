import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix SQL state 428C9: cannot insert into GENERATED ALWAYS AS columns.
 * recalculate_student_program_plos previously inserted is_achieved and achievement_level;
 * both are generated from average_attainment and must not be set by application/trigger code.
 */
export class FixPloCacheGeneratedColumnRefs1736860910000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION recalculate_student_program_plos(
        p_roll_no VARCHAR(50),
        p_batch_id INTEGER
      )
      RETURNS void AS $$
      DECLARE
        course_record RECORD;
        plo_num INTEGER;
        plo_key TEXT;
        plo_values NUMERIC[];
        total_attr NUMERIC;
        course_count INTEGER;
        avg_attr NUMERIC;
        contrib_courses JSONB;
        contrib_course JSONB;
      BEGIN
        FOR plo_num IN 1..12 LOOP
          plo_key := 'plo' || plo_num || '_value';
          plo_values := ARRAY[]::NUMERIC[];
          contrib_courses := '[]'::JSONB;

          FOR course_record IN
            SELECT 
              c.course_code,
              cspr.plo1_value, cspr.plo2_value, cspr.plo3_value, cspr.plo4_value,
              cspr.plo5_value, cspr.plo6_value, cspr.plo7_value, cspr.plo8_value,
              cspr.plo9_value, cspr.plo10_value, cspr.plo11_value, cspr.plo12_value
            FROM course_student_plo_results cspr
            INNER JOIN courses c ON cspr.course_id = c.id
            WHERE cspr.roll_no = p_roll_no
              AND cspr.batch_id = p_batch_id
          LOOP
            CASE plo_num
              WHEN 1 THEN IF course_record.plo1_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo1_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo1_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 2 THEN IF course_record.plo2_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo2_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo2_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 3 THEN IF course_record.plo3_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo3_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo3_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 4 THEN IF course_record.plo4_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo4_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo4_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 5 THEN IF course_record.plo5_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo5_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo5_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 6 THEN IF course_record.plo6_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo6_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo6_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 7 THEN IF course_record.plo7_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo7_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo7_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 8 THEN IF course_record.plo8_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo8_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo8_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 9 THEN IF course_record.plo9_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo9_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo9_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 10 THEN IF course_record.plo10_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo10_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo10_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 11 THEN IF course_record.plo11_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo11_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo11_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 12 THEN IF course_record.plo12_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo12_value);
                contrib_course := jsonb_build_object('course_code', course_record.course_code, 'attainment', course_record.plo12_value);
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
            END CASE;
          END LOOP;

          IF array_length(plo_values, 1) > 0 THEN
            SELECT COALESCE(SUM(val), 0), COUNT(*)
            INTO total_attr, course_count
            FROM unnest(plo_values) AS val;
            avg_attr := total_attr / course_count;

            INSERT INTO student_program_plo_cache (
              roll_no,
              batch_id,
              plo_number,
              total_attainment,
              course_count,
              average_attainment,
              contributing_courses,
              last_calculated
            ) VALUES (
              p_roll_no,
              p_batch_id,
              plo_num,
              total_attr,
              course_count,
              ROUND(avg_attr, 2),
              contrib_courses,
              NOW()
            )
            ON CONFLICT (roll_no, plo_number)
            DO UPDATE SET
              batch_id = EXCLUDED.batch_id,
              total_attainment = EXCLUDED.total_attainment,
              course_count = EXCLUDED.course_count,
              average_attainment = EXCLUDED.average_attainment,
              contributing_courses = EXCLUDED.contributing_courses,
              last_calculated = NOW(),
              updated_at = NOW();
          ELSE
            DELETE FROM student_program_plo_cache
            WHERE roll_no = p_roll_no AND plo_number = plo_num;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    /* No-op: previous migration defines the function. Reverting would require
       restoring the old, broken version. Use migration 1736860900000 fix instead. */
  }
}
