import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .table('student', t => {
            t.timestamp("last_seen", { useTz: false }).defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        });
};


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .table("student", t => {
            t.dropColumn("last_seen");
        });
};
