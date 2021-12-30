import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .createTable("city", t => {
            t.increments("city_uid");
            t.string("city", 40);
            t.string("state_province", 40);
            t.string("country", 40).notNullable();
            t.unique(["city", "state_province", "country"]);
        })
        .createTable("school", t => {
            t.increments("school_uid");
            t.string("name", 60);
            t.float("latitude");
            t.float("longitude");
            t.integer("city_uid").notNullable();
            t.unique(["name", "city_uid"]);
            t.foreign("city_uid").references("city_uid").inTable("wwg.city");
        })
        .createTable("school_alias", t => {
            t.integer("school_uid");
            t.string("alias", 60);
            t.primary(["school_uid", "alias"]);
            t.foreign("school_uid").references("school_uid").inTable("wwg.school").onDelete("CASCADE");
        })
        .createTable("curriculum", t => {
            t.string("curriculum_name", 20).primary();
        })
        .createTable("class", t => {
            t.specificType("class_number", "SMALLINT");
            t.integer("grad_year");
            t.string("curriculum_name").notNullable();
            t.primary(["class_number", "grad_year"]);
            t.foreign("curriculum_name").references("curriculum_name").inTable("wwg.curriculum");
        })
        .createTable("registration_key", t => {
            t.string("registration_key", 14);
            t.timestamp("expiration_date");
            t.specificType("class_number", "SMALLINT").notNullable();
            t.integer("grad_year").notNullable();
            t.boolean("activated").notNullable().defaultTo(true);
            t.primary(["registration_key", "expiration_date"]);
            t.foreign(["class_number", "grad_year"]).references(["class_number", "grad_year"]).inTable("wwg.class").onDelete("CASCADE");
        })
        .raw("CREATE TYPE student_visibility AS ENUM ('private', 'class', 'curriculum', 'year', 'students');")
        .createTable("visibility", t => {
            t.specificType("type", "student_visibility").primary();
            t.text("description");
        })
        .raw("CREATE TYPE student_role AS ENUM ('student', 'class', 'curriculum', 'year', 'system');")
        .createTable("role", t => {
            t.specificType("role", "student_role").notNullable().primary();
            t.specificType("level", "SMALLINT");
            t.text("description");
        })
        .createTable("student", t => {
            t.increments("student_uid");
            t.string("name", 30).notNullable();
            t.string("phone_number", 21).unique();
            t.string("email", 120).unique();
            t.specificType("password_hash", "CHAR(60)").notNullable();
            t.string("wxid", 20);
            t.string("department", 40);
            t.string("major", 40);
            t.specificType("class_number", "SMALLINT").notNullable();
            t.integer("grad_year").notNullable();
            t.integer("school_uid");
            t.specificType("visibility_type", "student_visibility").defaultTo("year");
            t.specificType("role", "student_role").defaultTo("student");
            t.foreign(["class_number", "grad_year"]).references(["class_number", "grad_year"]).inTable("wwg.class");
            t.foreign("school_uid").references("school_uid").inTable("wwg.school");
            t.foreign("role").references("role").inTable("wwg.role");
            t.foreign("visibility_type").references("type").inTable("wwg.visibility");
        })
        .raw("CREATE TYPE FEEDBACK_STATUS as ENUM ('resolved', 'pending', 'closed');")
        .createTable("feedback", t => {
            t.specificType("feedback_uid", "CHAR(22)").notNullable().primary();
            t.specificType("status", "FEEDBACK_STATUS").notNullable().defaultTo('pending');
            t.string("title", 120);
            t.text("content");
            t.string("reason", 120);
            t.string("phone_number", 120);
            t.string("email", 120);
            t.integer("sender_uid");
            t.string("name", 120);
            t.integer("class_number");
            t.integer("grad_year");
            t.timestamp("posted_at", { useTz: false }).defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        })
        .raw("CREATE TYPE STUDENT_FIELD as ENUM ('phone_number', 'email', 'wxid', 'department', 'major', 'school_uid', 'school_country', 'school_state_province', 'city');")
        .createTable("comment", t => {
            t.increments("comment_uid");
            t.specificType("feedback_uid", "CHAR(22)").notNullable();
            t.string("sender_name", 120);
            t.text("content");
            t.timestamp("posted_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
            t.foreign("feedback_uid").references("feedback_uid").inTable("wwg.feedback").onDelete("CASCADE");
        })
        .createTable("student_field_visibility", t => {
            t.integer("student_uid").notNullable();
            t.specificType("field", "STUDENT_FIELD").notNullable();
            t.boolean("hidden").defaultTo(false);
            t.primary(["student_uid", "field"]);
            t.foreign("student_uid").references("student_uid").inTable("wwg.student").onDelete("CASCADE");
        })
        .createTable("additional_info", t => {
            t.integer("student_uid").primary();
            t.string("key_name", 30).unique().notNullable();
            t.string("value", 255).notNullable();
            t.foreign("student_uid").references("student_uid").inTable("wwg.student").onDelete("CASCADE");
        })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .dropTableIfExists("additional_info")
        .dropTableIfExists("student_field_visibility")
        .dropTableIfExists("comment")
        .dropTableIfExists("feedback")
        .dropTableIfExists("student")
        .dropTableIfExists("role")
        .dropTableIfExists("visibility")
        .dropTableIfExists("registration_key")
        .dropTableIfExists("class")
        .dropTableIfExists("curriculum")
        .dropTableIfExists("school_alias")
        .dropTableIfExists("school")
        .dropTableIfExists("city")
        .raw("DROP TYPE STUDENT_FIELD;")
        .raw("DROP TYPE FEEDBACK_STATUS;")
        .raw("DROP TYPE student_visibility;")
        .raw("DROP TYPE student_role;");
}

