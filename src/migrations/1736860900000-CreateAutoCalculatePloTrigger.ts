import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutoCalculatePloTrigger1736860900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create function to recalculate PLOs for a student
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
        is_achieved_val BOOLEAN;
        achievement_lvl TEXT;
      BEGIN
        -- Loop through each PLO (1 to 12)
        FOR plo_num IN 1..12 LOOP
          plo_key := 'plo' || plo_num || '_value';
          
          -- Reset arrays
          plo_values := ARRAY[]::NUMERIC[];
          contrib_courses := '[]'::JSONB;
          
          -- Fetch all course-level PLO data for this student
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
            -- Get the PLO value dynamically
            CASE plo_num
              WHEN 1 THEN IF course_record.plo1_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo1_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo1_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 2 THEN IF course_record.plo2_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo2_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo2_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 3 THEN IF course_record.plo3_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo3_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo3_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 4 THEN IF course_record.plo4_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo4_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo4_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 5 THEN IF course_record.plo5_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo5_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo5_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 6 THEN IF course_record.plo6_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo6_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo6_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 7 THEN IF course_record.plo7_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo7_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo7_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 8 THEN IF course_record.plo8_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo8_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo8_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 9 THEN IF course_record.plo9_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo9_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo9_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 10 THEN IF course_record.plo10_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo10_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo10_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 11 THEN IF course_record.plo11_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo11_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo11_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
              WHEN 12 THEN IF course_record.plo12_value IS NOT NULL THEN
                plo_values := array_append(plo_values, course_record.plo12_value);
                contrib_course := jsonb_build_object(
                  'course_code', course_record.course_code,
                  'attainment', course_record.plo12_value
                );
                contrib_courses := contrib_courses || jsonb_build_array(contrib_course);
              END IF;
            END CASE;
          END LOOP;
          
          -- Calculate average if we have values
          IF array_length(plo_values, 1) > 0 THEN
            -- Calculate total and average
            SELECT COALESCE(SUM(val), 0), COUNT(*)
            INTO total_attr, course_count
            FROM unnest(plo_values) AS val;
            
            avg_attr := total_attr / course_count;
            
            -- Determine achievement level
            IF avg_attr >= 80 THEN
              achievement_lvl := 'High';
            ELSIF avg_attr >= 70 THEN
              achievement_lvl := 'Medium';
            ELSE
              achievement_lvl := 'Low';
            END IF;
            
            is_achieved_val := avg_attr >= 50;
            
            -- Insert or update cache
            INSERT INTO student_program_plo_cache (
              roll_no,
              batch_id,
              plo_number,
              total_attainment,
              course_count,
              average_attainment,
              is_achieved,
              achievement_level,
              contributing_courses,
              last_calculated
            ) VALUES (
              p_roll_no,
              p_batch_id,
              plo_num,
              total_attr,
              course_count,
              ROUND(avg_attr, 2),
              is_achieved_val,
              achievement_lvl,
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
            -- No data for this PLO, remove from cache if exists
            DELETE FROM student_program_plo_cache
            WHERE roll_no = p_roll_no AND plo_number = plo_num;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger function that fires on INSERT/UPDATE/DELETE
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_recalculate_plo_cache()
      RETURNS TRIGGER AS $$
      DECLARE
        v_roll_no VARCHAR(50);
        v_batch_id INTEGER;
      BEGIN
        -- Determine which roll_no and batch_id to use
        IF TG_OP = 'DELETE' THEN
          v_roll_no := OLD.roll_no;
          v_batch_id := OLD.batch_id;
        ELSE
          v_roll_no := NEW.roll_no;
          v_batch_id := NEW.batch_id;
        END IF;
        
        -- Recalculate PLOs for this student
        PERFORM recalculate_student_program_plos(v_roll_no, v_batch_id);
        
        -- Return appropriate record
        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        ELSE
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_course_student_plo_results_insert ON course_student_plo_results;
      CREATE TRIGGER trg_course_student_plo_results_insert
        AFTER INSERT ON course_student_plo_results
        FOR EACH ROW
        EXECUTE FUNCTION trigger_recalculate_plo_cache();
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_course_student_plo_results_update ON course_student_plo_results;
      CREATE TRIGGER trg_course_student_plo_results_update
        AFTER UPDATE ON course_student_plo_results
        FOR EACH ROW
        EXECUTE FUNCTION trigger_recalculate_plo_cache();
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_course_student_plo_results_delete ON course_student_plo_results;
      CREATE TRIGGER trg_course_student_plo_results_delete
        AFTER DELETE ON course_student_plo_results
        FOR EACH ROW
        EXECUTE FUNCTION trigger_recalculate_plo_cache();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_course_student_plo_results_insert ON course_student_plo_results;
      DROP TRIGGER IF EXISTS trg_course_student_plo_results_update ON course_student_plo_results;
      DROP TRIGGER IF EXISTS trg_course_student_plo_results_delete ON course_student_plo_results;
    `);

    // Drop functions
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS trigger_recalculate_plo_cache() CASCADE;
      DROP FUNCTION IF EXISTS recalculate_student_program_plos(VARCHAR, INTEGER) CASCADE;
    `);
  }
}

