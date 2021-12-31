import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .createView("student_class", v => {
            v.as(knex.select('*')
                .from("wwg.student")
                .joinRaw("NATURAL JOIN wwg.class")
            );
        })
        .createView("student_class_role", v => {
            v.as(knex.select('*')
                .from("wwg.student_class")
                .joinRaw("NATURAL JOIN wwg.role")
            );
        });
};


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema("wwg")
        .dropViewIfExists("student_class")
        .dropViewIfExists("student_class_role");
};
