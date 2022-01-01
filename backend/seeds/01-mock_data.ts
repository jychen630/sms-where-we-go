import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("wwg.registration_key").del();
    await knex("wwg.student").del();
    await knex("wwg.class").del();
    await knex("wwg.curriculum").del();
    await knex("wwg.school").del();
    await knex("wwg.city").del();


    // Inserts seed entries
    const [city_a_uid, city_b_uid] = await knex("wwg.city").insert([
        {
            city: "深圳",
            state_province: "广东",
            country: "中国",
        },
        {
            city: "伤害",
            state_province: "商海",
            country: "中国",
        },
    ]).returning("city_uid");

    const [school_a_uid, school_b_uid] = await knex("wwg.school").insert([
        {
            name: "北京大学",
            latitude: 39.99152336539453,
            longitude: 116.3047986254831,
            city_uid: city_a_uid,
        },
        {
            name: "TESTING UNIVERSITY",
            latitude: 39.99152336539453,
            longitude: 116.3047986254831,
            city_uid: city_b_uid,
        }
    ]).returning("school_uid");

    await knex("wwg.curriculum").insert([
        {
            curriculum_name: "international",
        },
        {
            curriculum_name: "gaokao",
        },
    ]);

    await knex("wwg.class").insert([
        {
            class_number: 2,
            grad_year: 2019,
            curriculum_name: "gaokao",
        },
        {
            class_number: 3,
            grad_year: 2019,
            curriculum_name: "gaokao",
        },
        {
            class_number: 2,
            grad_year: 2020,
            curriculum_name: "gaokao",
        },
        {
            class_number: 4,
            grad_year: 2019,
            curriculum_name: "international",
        },
        {
            class_number: 5,
            grad_year: 2019,
            curriculum_name: "international",
        },
    ]);

    await knex("wwg.student").insert([

        {
            name: "Ming",
            phone_number: "18923232323",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 2,
            grad_year: 2019,
            school_uid: school_b_uid,
        },
        {
            name: "Dan",
            phone_number: "13988889999",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 2,
            grad_year: 2019,
            school_uid: school_b_uid,
            visibility_type: "class",
            role: "class",
        },
        {
            name: "Kang",
            phone_number: "13634343434",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 2,
            grad_year: 2020,
            school_uid: school_a_uid,
            visibility_type: "curriculum",
        },
        {
            name: "Wang",
            phone_number: "18612344321",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 2,
            grad_year: 2020,
            school_uid: school_a_uid,
            visibility_type: "curriculum",
            role: "system",
        },
        {
            name: "Fang",
            phone_number: "13900002222",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 3,
            grad_year: 2019,
            school_uid: school_a_uid,
            visibility_type: "private",
        },
        {
            name: "Zheng",
            phone_number: "13900006666",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 4,
            grad_year: 2019,
            school_uid: school_a_uid,
            visibility_type: "curriculum",
            role: "curriculum",
        },
        {
            name: "Gao",
            phone_number: "18912346666",
            password_hash:
                "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
            class_number: 5,
            grad_year: 2019,
            school_uid: school_b_uid,
            visibility_type: "curriculum",
            role: "year",
        },
    ]);

    await knex("wwg.registration_key").insert(
        {
            registration_key: "202106wwgasdfg",
            expiration_date: new Date("2022").toISOString(),
            class_number: 2,
            grad_year: 2019,
        }
    );

};
