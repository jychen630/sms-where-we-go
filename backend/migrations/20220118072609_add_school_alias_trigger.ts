import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.raw(
        `CREATE FUNCTION add_alias() RETURNS trigger AS $$
            BEGIN
                INSERT INTO wwg.school_alias VALUES (
                    NEW.school_uid,
                    NEW.name
                );
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;`
    ).then(() => knex.raw(
        `CREATE TRIGGER school_insert
            AFTER INSERT ON wwg.school
            FOR EACH ROW
            EXECUTE FUNCTION add_alias();`
    ))

}


export async function down(knex: Knex): Promise<void> {
    return knex.raw("DROP TRIGGER school_insert ON wwg.school;").then(() => knex.raw("DROP FUNCTION add_alias;"));
}
