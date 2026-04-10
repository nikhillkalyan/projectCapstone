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
        try {
            // Drop hibernate generated check constraint on approval_status to allow new REMOVED enum value
            jdbcTemplate.execute("DO $$ \n" +
                    "DECLARE text_var text; \n" +
                    "BEGIN \n" +
                    "    FOR text_var IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'instructors' AND constraint_type = 'CHECK' AND constraint_name LIKE '%approval_status%') \n" +
                    "    LOOP \n" +
                    "        EXECUTE 'ALTER TABLE instructors DROP CONSTRAINT ' || text_var; \n" +
                    "    END LOOP; \n" +
                    "END $$;");
        } catch (Exception e) {
            System.out.println("Could not drop constraint: " + e.getMessage());
        }
    }
}
