package backend.backend.Configs;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void runMigration() {
        // Drop Hibernate-generated check constraint on instructors.approval_status
        // to allow the REMOVED enum value added later
        try {
            jdbcTemplate.execute("DO $$ \n" +
                    "DECLARE text_var text; \n" +
                    "BEGIN \n" +
                    "    FOR text_var IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'instructors' AND constraint_type = 'CHECK' AND constraint_name LIKE '%approval_status%') \n" +
                    "    LOOP \n" +
                    "        EXECUTE 'ALTER TABLE instructors DROP CONSTRAINT ' || text_var; \n" +
                    "    END LOOP; \n" +
                    "END $$;");
        } catch (Exception e) {
            System.out.println("Could not drop instructors constraint: " + e.getMessage());
        }

        // Drop Hibernate-generated check constraint on users.role
        // to allow UNIVERSITY_ADMIN enum value added in Phase 2
        try {
            jdbcTemplate.execute("DO $$ \n" +
                    "DECLARE text_var text; \n" +
                    "BEGIN \n" +
                    "    FOR text_var IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_type = 'CHECK' AND constraint_name LIKE '%role%') \n" +
                    "    LOOP \n" +
                    "        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || text_var; \n" +
                    "    END LOOP; \n" +
                    "END $$;");
        } catch (Exception e) {
            System.out.println("Could not drop users role constraint: " + e.getMessage());
        }

        // Project space schema repair for environments where Hibernate update did
        // not create the new tables/columns cleanly.
        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS project_spaces (
                        id UUID PRIMARY KEY,
                        course_id UUID NOT NULL UNIQUE,
                        instructor_id UUID NOT NULL,
                        group_size INTEGER NOT NULL,
                        proposal_deadline TIMESTAMP,
                        project_deadline TIMESTAMP,
                        project_description TEXT,
                        is_groups_formed BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE project_spaces
                    ADD COLUMN IF NOT EXISTS proposal_deadline TIMESTAMP,
                    ADD COLUMN IF NOT EXISTS project_deadline TIMESTAMP,
                    ADD COLUMN IF NOT EXISTS project_description TEXT,
                    ADD COLUMN IF NOT EXISTS is_groups_formed BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE instructors
                    ADD COLUMN IF NOT EXISTS github_pat TEXT
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE project_groups
                    ADD COLUMN IF NOT EXISTS project_space_id UUID,
                    ADD COLUMN IF NOT EXISTS status VARCHAR(30),
                    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
                    ADD COLUMN IF NOT EXISTS assigned_by_instructor BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS instructor_assigned_doc TEXT
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE project_groups
                    ADD COLUMN IF NOT EXISTS is_proposal_approved BOOLEAN DEFAULT FALSE
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS project_proposals (
                        id UUID PRIMARY KEY,
                        group_id UUID NOT NULL UNIQUE,
                        project_title VARCHAR(255) NOT NULL,
                        description TEXT,
                        doc_url TEXT,
                        status VARCHAR(20) DEFAULT 'PENDING',
                        rejection_reason TEXT,
                        reviewed_at TIMESTAMP,
                        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS individual_reports (
                        id UUID PRIMARY KEY,
                        student_id UUID NOT NULL,
                        project_group_id UUID NOT NULL,
                        file_url TEXT NOT NULL,
                        description TEXT,
                        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT uq_individual_reports_student_group UNIQUE (student_id, project_group_id)
                    )
                    """);

            jdbcTemplate.update("""
                    UPDATE project_spaces
                    SET is_groups_formed = FALSE
                    WHERE is_groups_formed IS NULL
                    """);

            jdbcTemplate.update("""
                    UPDATE project_groups
                    SET status = 'FORMING'
                    WHERE status IS NULL
                    """);

            jdbcTemplate.update("""
                    UPDATE project_groups
                    SET assigned_by_instructor = FALSE
                    WHERE assigned_by_instructor IS NULL
                    """);

            jdbcTemplate.update("""
                    UPDATE project_groups
                    SET is_proposal_approved = FALSE
                    WHERE is_proposal_approved IS NULL
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS project_activity_events (
                        id UUID PRIMARY KEY,
                        course_id UUID NOT NULL,
                        project_space_id UUID NOT NULL,
                        project_group_id UUID,
                        actor_user_id UUID,
                        event_type VARCHAR(60) NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        metadata_json TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS project_group_messages (
                        id UUID PRIMARY KEY,
                        course_id UUID NOT NULL,
                        project_space_id UUID NOT NULL,
                        project_group_id UUID NOT NULL,
                        sender_user_id UUID NOT NULL,
                        message_text TEXT NOT NULL,
                        is_edited BOOLEAN DEFAULT FALSE,
                        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS project_group_chat_reads (
                        id UUID PRIMARY KEY,
                        project_group_id UUID NOT NULL,
                        user_id UUID NOT NULL,
                        last_read_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT uq_project_group_chat_reads_group_user UNIQUE (project_group_id, user_id)
                    )
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS github_branch_snapshots (
                        id UUID PRIMARY KEY,
                        project_group_id UUID NOT NULL,
                        project_repo_id UUID NOT NULL,
                        branch_name VARCHAR(255) NOT NULL,
                        last_commit_sha VARCHAR(120),
                        last_commit_message TEXT,
                        last_commit_author VARCHAR(255),
                        last_commit_date VARCHAR(255),
                        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS github_pull_request_snapshots (
                        id UUID PRIMARY KEY,
                        project_group_id UUID NOT NULL,
                        project_repo_id UUID NOT NULL,
                        pr_number INTEGER NOT NULL,
                        title TEXT NOT NULL,
                        state VARCHAR(30) NOT NULL,
                        author_name VARCHAR(255),
                        source_branch VARCHAR(255),
                        target_branch VARCHAR(255),
                        created_at_remote VARCHAR(255),
                        merged_at_remote VARCHAR(255),
                        pr_url TEXT,
                        changed_files INTEGER,
                        additions INTEGER,
                        deletions INTEGER,
                        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS github_commit_snapshots (
                        id UUID PRIMARY KEY,
                        project_group_id UUID NOT NULL,
                        project_repo_id UUID NOT NULL,
                        commit_sha VARCHAR(120) NOT NULL,
                        short_sha VARCHAR(20),
                        commit_message TEXT,
                        author_name VARCHAR(255),
                        committed_at VARCHAR(255),
                        branch_name VARCHAR(255),
                        commit_url TEXT,
                        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
        } catch (Exception e) {
            System.out.println("Could not repair project space schema: " + e.getMessage());
        }
    }
}
