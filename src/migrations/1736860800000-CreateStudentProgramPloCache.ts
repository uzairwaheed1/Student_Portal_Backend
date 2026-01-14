import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentProgramPloCache1736860800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'student_program_plo_cache'
      );
    `);

    if (!tableExists[0].exists) {
      // Create table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE student_program_plo_cache (
          id SERIAL PRIMARY KEY,
          
          -- Student Identifier
          roll_no VARCHAR(50) NOT NULL,
          batch_id INTEGER NOT NULL,
          plo_number INTEGER NOT NULL CHECK (plo_number BETWEEN 1 AND 12),
          
          -- Aggregated Metrics
          total_attainment DECIMAL(10,2) NOT NULL DEFAULT 0,
          course_count INTEGER NOT NULL DEFAULT 0,
          average_attainment DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (average_attainment >= 0 AND average_attainment <= 100),
          
          -- Achievement Status
          is_achieved BOOLEAN GENERATED ALWAYS AS (average_attainment >= 50) STORED,
          achievement_level VARCHAR(20) GENERATED ALWAYS AS (
            CASE 
              WHEN average_attainment >= 80 THEN 'High'
              WHEN average_attainment >= 70 THEN 'Medium'
              ELSE 'Low'
            END
          ) STORED,
          
          -- Metadata - stores which courses contributed
          contributing_courses JSONB,
          last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Unique constraint: One record per student per PLO
          CONSTRAINT unique_rollno_plo UNIQUE (roll_no, plo_number)
        );
      `);
    }

    // Create indexes (IF NOT EXISTS equivalent)
    const indexes = [
      { name: 'idx_rollno_batch', query: 'CREATE INDEX IF NOT EXISTS idx_rollno_batch ON student_program_plo_cache(roll_no, batch_id);' },
      { name: 'idx_batch_plo', query: 'CREATE INDEX IF NOT EXISTS idx_batch_plo ON student_program_plo_cache(batch_id, plo_number);' },
      { name: 'idx_achievement', query: 'CREATE INDEX IF NOT EXISTS idx_achievement ON student_program_plo_cache(is_achieved);' },
      { name: 'idx_avg_attainment', query: 'CREATE INDEX IF NOT EXISTS idx_avg_attainment ON student_program_plo_cache(average_attainment);' },
    ];

    for (const index of indexes) {
      await queryRunner.query(index.query);
    }
    
    // Create or replace function and trigger
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Drop trigger if exists and recreate
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_student_program_plo_cache_updated_at ON student_program_plo_cache;
    `);
    
    await queryRunner.query(`
      CREATE TRIGGER update_student_program_plo_cache_updated_at 
          BEFORE UPDATE ON student_program_plo_cache 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_student_program_plo_cache_updated_at ON student_program_plo_cache;`);
    await queryRunner.query(`DROP TABLE IF EXISTS student_program_plo_cache CASCADE;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;`);
  }
}

