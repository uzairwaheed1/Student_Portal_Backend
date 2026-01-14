import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    Index,
    Unique,
  } from 'typeorm';
  import { Course } from '../../courses/entities/course.entity';
  import { Semester } from '../../semester/entities/semester.entity';
  import { FacultyProfile } from '../../admin/entities/faculty-profile.entity';
//   import { CourseStudentPloResult } from './CourseStudentPloResult';
//   import { Assessment } from './Assessment';
  
  /**
   * CourseOffering Entity
   * 
   * Represents a specific instance of a course being taught in a particular semester.
   * This is the central entity for OBE tracking as it:
   * - Links a course to a specific semester (temporal context)
   * - Assigns an instructor responsible for that offering
   * - Serves as the parent for all assessments and PLO results for that semester
   * - Enables the same course to be tracked separately across different semesters
   * 
   * Example: "CE-609 Petroleum Refinery Engineering" taught in Fall 2024 by Dr. Smith
   * is a different offering than the same course in Spring 2025 by Dr. Jones.
   */
  @Entity('course_offerings')
  @Unique('unique_course_semester', ['course_id', 'semester_id']) // Prevent duplicate offerings
  @Index('idx_semester_id', ['semester_id']) // Fast queries by semester
  @Index('idx_instructor_id', ['instructor_id']) // Fast queries by instructor
  @Index('idx_course_semester', ['course_id', 'semester_id']) // Composite index for common queries
  export class CourseOffering {
    /**
     * Primary Key - Auto-incrementing unique identifier
     */
    @PrimaryGeneratedColumn()
    id: number;
  
    /**
     * Foreign Key to Course table
     * Links to the course definition (CE-609, credit hours, etc.)
     * NOT NULL - Every offering must be linked to a course
     */
    @Column({ type: 'int', nullable: false })
    course_id: number;
  
    /**
     * Foreign Key to Semester table
     * Links to the specific semester when this course is offered
     * NOT NULL - Every offering must belong to a semester
     * This enables semester-level locking and visibility control
     */
    @Column({ type: 'int', nullable: false })
    semester_id: number;
  
    /**
     * Foreign Key to User table (Faculty profile)
     * Identifies the instructor teaching this course offering
     * NOT NULL - Every offering must have an assigned instructor
     * Used for permissions: faculty can only edit their own offerings
     */
    @Column({ type: 'int', nullable: false })
    instructor_id: number;
  
    /**
     * Timestamp - Auto-populated on record creation
     * Tracks when the course offering was created in the system
     * Useful for audit trails and historical tracking
     */
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    // ========================================
    // RELATIONSHIPS (TypeORM Associations)
    // ========================================
  
    /**
     * Many-to-One: CourseOffering → Course
     * Multiple offerings can exist for the same course (different semesters)
     */
    @ManyToOne(() => Course, (course) => course.courseOfferings, {
      onDelete: 'CASCADE', // Delete offerings if course is deleted
      nullable: false,
    })
    @JoinColumn({ name: 'course_id' })
    course: Course;
  
    /**
     * Many-to-One: CourseOffering → Semester
     * Multiple offerings can exist in the same semester (different courses)
     */
    @ManyToOne(() => Semester, (semester) => semester.courseOfferings, {
      onDelete: 'CASCADE', // Delete offerings if semester is deleted
      nullable: false,
    })
    @JoinColumn({ name: 'semester_id' })
    semester: Semester;
  
    /**
     * Many-to-One: CourseOffering → User (Instructor)
     * Multiple offerings can be taught by the same instructor
     */
    @ManyToOne(() => FacultyProfile, (faculty) => faculty.courseOfferings, {
        onDelete: 'RESTRICT', // Prevent deletion of faculty if they have offerings
        nullable: false,
      })
      @JoinColumn({ name: 'instructor_id' })
      instructor: FacultyProfile;
  
    /**
     * One-to-Many: CourseOffering → CourseStudentPloResult
     * Each offering can have multiple PLO result uploads
     * (e.g., one per student enrolled in that offering)
     */
    // @OneToMany(
    //   () => CourseStudentPloResult,
    //   (result) => result.courseOffering,
    //   { cascade: true }
    // )
    // courseStudentPloResults: CourseStudentPloResult[];
  
    // /**
    //  * One-to-Many: CourseOffering → Assessment
    //  * Each offering has its own assessments (quizzes, exams, projects)
    //  * Assessments are NOT shared across offerings
    //  */
    // @OneToMany(() => Assessment, (assessment) => assessment.courseOffering, {
    //   cascade: true,
    // })
    // assessments: Assessment[];
  }
  
  
  // ========================================
  // EXPLANATION & DESIGN RATIONALE
  // ========================================
  
  /**
   * WHY THIS DESIGN?
   * 
   * 1. TEMPORAL SEPARATION
   *    - The same course (e.g., CE-609) taught in different semesters should have
   *      separate tracking for assessments, marks, and PLO attainments.
   *    - CourseOffering provides this temporal context.
   * 
   * 2. INSTRUCTOR ACCOUNTABILITY
   *    - Each offering is owned by a specific instructor.
   *    - Permissions: Faculty can only edit offerings they're assigned to.
   *    - Admin can view/manage all offerings.
   * 
   * 3. SEMESTER-LEVEL CONTROL
   *    - When a semester is locked (is_locked = true), all offerings in that
   *      semester become read-only.
   *    - This prevents accidental modification of historical data.
   * 
   * 4. UNIQUE CONSTRAINT
   *    - @Unique(['course_id', 'semester_id']) ensures:
   *      → A course can only be offered ONCE per semester
   *      → Prevents duplicate entries (e.g., two CE-609 offerings in Fall 2024)
   * 
   * 5. CASCADE DELETION
   *    - If a semester or course is deleted, all related offerings are removed.
   *    - This maintains referential integrity without orphaned records.
   * 
   * 6. RESTRICT ON INSTRUCTOR
   *    - Cannot delete a user (faculty) if they have active course offerings.
   *    - Must reassign or remove offerings first (data safety).
   * 
   * 7. INDEXING STRATEGY
   *    - idx_semester_id: Fast queries like "Get all courses in Semester 5"
   *    - idx_instructor_id: Fast queries like "Get all courses taught by Dr. Smith"
   *    - idx_course_semester: Composite index for joins and lookups
   * 
   * 8. OBE WORKFLOW FIT
   *    - Admin creates CourseOffering when assigning courses to semesters
   *    - Faculty uploads marks/assessments linked to their offering
   *    - Students see only active offerings (semester.is_active = true)
   *    - Reports aggregate PLO attainments per offering, then roll up to batch level
   * 
   * EXAMPLE DATA FLOW:
   * 
   * Batch 2021 → Semester 7 (Fall 2024) → CourseOffering (CE-609, Dr. Khan)
   *                                      → Assessments (Quiz 1, Midterm, Final)
   *                                      → CourseStudentPloResults (30 students)
   *                                      → PLO Attainment Calculation
   * 
   * This design ensures:
   * ✅ Data integrity (constraints + foreign keys)
   * ✅ Proper OBE tracking per semester
   * ✅ Role-based access control
   * ✅ Historical data preservation (via locking)
   * ✅ Scalability (indexes for performance)
   */