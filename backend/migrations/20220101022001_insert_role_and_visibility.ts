import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex("wwg.visibility").insert([
        {
            type: 'private',
            description: 'Visible only to the student themself'
        },
        {
            type: 'class',
            description: 'Visible only to the students in the same class'
        },
        {
            type: 'curriculum',
            description: 'Visible only to the students within the same curriculum'
        },
        {
            type: 'year',
            description: 'Visible only to the students who graduate in the same year'
        },
        {
            type: 'students',
            description: 'Visible only to any registered users (including past and future students)'
        },
    ]).then(() => knex("wwg.role").insert([
        {
            role: 'student',
            level: 0,
            description: 'Limited write access to the user itself'
        },
        {
            role: 'class',
            level: 2,
            description: 'Write access to the students within a class'
        },
        {
            role: 'curriculum',
            level: 4,
            description: 'Write access to the student within a curriculum'
        },
        {
            role: 'year',
            level: 8,
            description: 'Write access to the students who graduate in the same year'
        },
        {
            role: 'system',
            level: 16,
            description: 'Write access to the all students including admin students'
        }
    ]))
}


export async function down(knex: Knex): Promise<void> {
    return knex("role").del()
        .then(() => knex("visibility").del());
}

