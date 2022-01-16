import { Knex } from "knex";
import faker, { fake, random } from "faker";

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
let role = ['student', 'class', 'curriculum', 'year', 'system']

function pick(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
}

let countries = new Array(20).fill(undefined)
    .map(_ => faker.address.country())
    .filter(country => country.length < 40);

let cities = new Array(100).fill(undefined).map(_ => ({
    city: faker.address.city(),
    state_province: faker.address.state(),
    country: pick(countries)
}));

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
    await knex("wwg.school").del();
    await knex("wwg.city").del();


    // Inserts seed entries

    // Faker user info
    const city_uids = await knex("wwg.city").insert(cities).returning("city_uid");

    const school_uids = await knex("wwg.school").insert(
        new Array(100).fill(undefined).map(_ => ({
            name: `${faker.address.city()} State University`,
            latitude: faker.address.longitude(),
            longitude: faker.address.latitude(),
            city_uid: pick(city_uids),
        }))
    ).returning("school_uid");

    await knex("wwg.curriculum").insert(curriculums);

    await knex("wwg.class").insert(classes);

    await knex("wwg.student").insert(
        new Array(100).fill(undefined).map(_ => ({
            name: faker.name.findName(),
            phone_number: faker.phone.phoneNumberFormat(),
            email:faker.internet.email(),
            major:"Undecided",
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
    const demo_city_uid = await knex("wwg.city").insert({
        city: 'Yew Nork City',
        state_province: 'Demo',
        country: 'Nacirema',
    }).returning("city_uid");

    const demo_school_uid = await knex("wwg.school").insert({   
        name: "Yew Nork University",
        longitude: "73.9965",
        latitude: "40.7295",
        city_uid: demo_city_uid,        
    }).returning("school_uid")

    await knex("wwg.student").insert([{
        name: "Demo Chen",
        phone_number: "929-888-9999",
        email: "jychen630@wherewego.cn",
        major: "Undecided",
        class_number: 13,
        grad_year: 2020,
        school_uid: demo_school_uid,
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
