import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserNameEmailToActivityLog1700000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE activity_logs
            ADD COLUMN IF NOT EXISTS user_name varchar(255) NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS user_email varchar(255) NOT NULL DEFAULT '';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE activity_logs
            DROP COLUMN IF EXISTS user_name,
            DROP COLUMN IF EXISTS user_email;
        `);
    }

}
