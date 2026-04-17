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
    }
}
