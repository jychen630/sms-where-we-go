import { Knex } from "knex";
import faker, { random } from "faker";

let city = faker.address.city();
let long = faker.address.longitude();
let lat = faker.address.latitude();
let name = faker.name.findName();
let gradYear = faker.datatype.number(1) + 2019;
let classNumber = faker.datatype.number(19) + 1;
let registrationKey = faker.random.alphaNumeric(14);
let curriculum = ["domestic", "international"];
let phoneNumber = faker.phone.phoneNumberFormat();
let visibilityType = ["private", "class", "curriculum", "year", "students",]
let role = ['student','class','curriculum','year','system']

let cities = new Array(100).fill(undefined).map(_ => ({
    city:faker.address.city(), 
    state_province:faker.address.state(),
    country:faker.address.country()
}));

let curriculums = new Array(2).fill(undefined).map((_,i) => ({
    curriculum_name:curriculum[i]
}));

let classes = new Array(40).fill(undefined).map((_,i) => ({
    class_number: i % 20 + 1,
    grad_year: i <= 20 ? 2019 : 2020,
    curriculum_name: (i % 20 + 1) < 17 ? curriculum[0] : curriculum[1],
}));

let registrationkeys = new Array(100).fill(undefined).map(_ => ({
    registration_key: faker.random.alphaNumeric(14),
    expiration_date: new Date("2022").toISOString(),
    class_number: faker.datatype.number(19) + 1,
    grad_year: faker.datatype.number(1) + 2019,
}))


export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("wwg.registration_key").del();
    await knex("wwg.student").del();
    await knex("wwg.class").del();
    await knex("wwg.curriculum").del();
    await knex("wwg.school").del();
    await knex("wwg.city").del();


    // Inserts seed entries
    const city_uids = await knex("wwg.city").insert(cities).returning("city_uid");

    const school_uids = await knex("wwg.school").insert(
        new Array(100).fill(undefined).map(_ => ({
            name: `${faker.address.city()} State University`,
            latitude: faker.address.longitude(),
            longitude: faker.address.latitude(),
            city_uid: city_uids[Math.floor(Math.random() * city_uids.length + 1)],
        }))
        ).returning("school_uid");

    await knex("wwg.curriculum").insert(curriculums);

    await knex("wwg.class").insert(classes);

    await knex("wwg.student").insert(
        new Array(100).fill(undefined).map(_ => ({
            name: faker.name.findName(),
            phone_number: faker.phone.phoneNumberFormat(),
            class_number: faker.datatype.number(19) + 1,
            grad_year: faker.datatype.number(1) + 2019,
            school_uid: school_uids[Math.floor(Math.random() * school_uids.length + 1)],
            password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            visibility_type: visibilityType[Math.floor(Math.random() * visibilityType.length + 1)],
            role: role[Math.floor(Math.random() * role.length + 1)]   
        })) 
    );

    await knex("wwg.registration_key").insert(registrationkeys);

};
