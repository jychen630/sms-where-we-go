import knex, { Knex } from "knex";
import faker, { fake, random } from "faker";

import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse/sync';


const csvFilePath = path.resolve('./seeds/school_seeds.csv');
const headers = ['NAME', 'CITY', 'STATE', 'ZIP', 'LAT', 'LON', 'CBSA', 'NMCBSA'];
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

type school = {
    NAME: string,
    CITY: string,
    LAT: string,
    LON: string
}
const school_demo: school[] = parse(fileContent, {
    delimiter: ',',
    columns: true,
}).filter((school: school) => school.NAME.length < 60);

let cities = school_demo.map((s: school) => ({
    city: s.CITY,
    country: "United States"
}));
cities = [...new Set(cities)];
let curriculum = ["domestic", "international"];
let visibilityType = ["private", "class", "curriculum", "year", "students",]
let role = ['student', 'class', 'curriculum', 'year', 'system']

function pick(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
}
/*
let countries = new Array(20).fill(undefined)
    .map(_ => faker.address.country())
    .filter(country => country.length < 40);
*/
/*
let cities = new Array(100).fill(undefined).map(_ => ({
    city: faker.address.city(),
    state_province: faker.address.state(),
    country: pick(countries)
}));
*/

let curriculums = new Array(2).fill(undefined).map((_, i) => ({
    curriculum_name: curriculum[i]
}));

let classes = new Array(40).fill(undefined).map((_, i) => ({
    class_number: i % 20 + 1,
    grad_year: i < 20 ? 2019 : 2020,
    curriculum_name: (i % 20 + 1) < 17 ? curriculum[0] : curriculum[1],
}));

let registrationkeys = new Array(100).fill(undefined).map(_ => ({
    registration_key: faker.random.alphaNumeric(14),
    expiration_date: new Date("2023").toISOString(),
    class_number: faker.datatype.number(19) + 1,
    grad_year: faker.datatype.number(1) + 2019,
}))

let demo_username = 'demo';
let demo_pw = 'demopw';


export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("wwg.registration_key").del();
    await knex("wwg.student").del();
    await knex("wwg.class").del();
    await knex("wwg.curriculum").del();
    await knex("wwg.school_alias").del();
    await knex("wwg.school").del();
    await knex("wwg.city").del();


    // Inserts seed entries

    // Faker user info
    const city_objs = await knex("wwg.city").insert(cities).returning(["city_uid", "city"]);
    let universities = school_demo.map((s: school) => ({
        name: s.NAME,
        city_uid: (city_objs.find(c => c.city === s.CITY)).city_uid,
        longitude: s.LON,
        latitude: s.LAT
    }));


    const school_uids = await knex("wwg.school").insert(universities).returning("school_uid");

    await knex("wwg.curriculum").insert(curriculums);

    await knex("wwg.class").insert(classes);

    await knex("wwg.student").insert(
        new Array(100).fill(undefined).map(_ => ({
            name: faker.name.findName(),
            phone_number: faker.phone.phoneNumberFormat(),
            email: faker.internet.email(),
            major: "Undecided",
            class_number: faker.datatype.number(19) + 1,
            grad_year: faker.datatype.number(1) + 2019,
            school_uid: pick(school_uids),
            password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            visibility_type: pick(visibilityType),
            role: pick(role)
        }))
    );

    await knex("wwg.registration_key").insert(registrationkeys);


    // Demo user profile
    const demo_city_uid = await knex("wwg.city").insert([{
        city: 'Yew Nork City',
        state_province: 'Demo',
        country: 'Nacirema',
    }]).returning("city_uid");

    const demo_school_uid = await knex("wwg.school").insert([{
        name: "Yew Nork University",
        longitude: "73.9965",
        latitude: "40.7295",
        city_uid: demo_city_uid[0],
    }]).returning("school_uid")

    await knex("wwg.student").insert([{
        name: "Demo Chen",
        phone_number: "929-888-9999",
        email: "jychen630@wherewego.cn",
        major: "Undecided",
        class_number: 13,
        grad_year: 2020,
        school_uid: demo_school_uid[0],
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        visibility_type: "students",
        role: "system"
    }])

    await knex("wwg.registration_key").insert({
        registration_key: "demoregkey2022",
        expiration_date: new Date("2023").toISOString(),
        class_number: 13,
        grad_year: 2020,
    })
};
