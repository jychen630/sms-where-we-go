import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .createTable("consent", t => {
            t.increments("consent_uid");
            t.string("consent_type", 20).notNullable();
            t.string("vesion", 20).notNullable();
            t.timestamp("created_at", { useTz: false }).notNullable();
        })
        .createTable("consent_history", t => {
            t.increments("consent_history_uid");
            t.integer("student_uid").notNullable();
            t.integer("consent_uid").notNullable();
            t.boolean("granted").defaultTo(false);
            t.foreign("student_uid").references("student_uid").inTable("wwg.student").onDelete("CASCADE");
            t.foreign("consent_uid").references("consent_uid").inTable("wwg.consent").onDelete("CASCADE");
            t.timestamp("updated_at", { useTz: false }).notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        });
};


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .dropTableIfExists("consent_history")
        .dropTableIfExists("consent");
};
