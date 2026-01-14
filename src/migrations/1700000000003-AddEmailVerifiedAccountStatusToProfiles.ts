import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerifiedAccountStatusToProfiles1700000000003 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns to admin_profiles
        await queryRunner.query(`
            ALTER TABLE admin_profiles
            ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS account_status varchar(20) NOT NULL DEFAULT 'pending';
        `);

        // Add columns to faculty_profiles
        await queryRunner.query(`
            ALTER TABLE faculty_profiles
            ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS account_status varchar(20) NOT NULL DEFAULT 'pending';
        `);

        // Add columns to student_profiles
        await queryRunner.query(`
            ALTER TABLE student_profiles
            ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS account_status varchar(20) NOT NULL DEFAULT 'pending';
        `);

        // Sync existing data from users table to profiles
        await queryRunner.query(`
            UPDATE admin_profiles ap
            SET email_verified = u.email_verified,
                account_status = u.account_status
            FROM users u
            WHERE ap.user_id = u.id;
        `);

        await queryRunner.query(`
            UPDATE faculty_profiles fp
            SET email_verified = u.email_verified,
                account_status = u.account_status
            FROM users u
            WHERE fp.user_id = u.id;
        `);

        await queryRunner.query(`
            UPDATE student_profiles sp
            SET email_verified = u.email_verified,
                account_status = u.account_status
            FROM users u
            WHERE sp.user_id = u.id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from student_profiles
        await queryRunner.query(`
            ALTER TABLE student_profiles
            DROP COLUMN IF EXISTS email_verified,
            DROP COLUMN IF EXISTS account_status;
        `);

        // Remove columns from faculty_profiles
        await queryRunner.query(`
            ALTER TABLE faculty_profiles
            DROP COLUMN IF EXISTS email_verified,
            DROP COLUMN IF EXISTS account_status;
        `);

        // Remove columns from admin_profiles
        await queryRunner.query(`
            ALTER TABLE admin_profiles
            DROP COLUMN IF EXISTS email_verified,
            DROP COLUMN IF EXISTS account_status;
        `);
    }

}

