# SMS Where We Go Project

A site that visualizes students’ contact information to reconnect them after graduation.

Live demo: [demo.wherewego.cn](https://demo.wherewego.cn)

You may access our demo site with the following account:

identifier: jychen630@wherewego.cn

password: asd

## Setup

```
git clone https://github.com/AcKindle3/sms-where-we-go.git
cd sms-where-we-go
sh setup.sh
```

**Note that to set up the project, you need to be able to run shell scripts**

## Deployment

```
cd sms-where-we-go
sh deploy.sh
```

This will run the development build of the website.
(By default, the frontend runs at port 3000, the backend runs at port 8080)

## Overview

-   Web: React + Typescript + Ant Design + MapBox GL
-   API: Node.js + TypeScript + Express + OpenAPI
-   Database: PostgreSQL + Knex.js

# Architecture Overview

![image](https://user-images.githubusercontent.com/39874143/149907479-f9e6c3b1-7978-4911-9ef2-887fe9fe2cbb.png)

Where We Go Project is a web-based application consisted that can be divided into four main services:

## Nginx

A reverse proxy before the API service and the web serivce.

## Web

A web server that serves the static contents.

-   TypeScript
-   MapBox (Map provider)
-   i18next (Translation tool)
-   Serve (Static content server)
-   React.js (Frontend framework)
-   AntDesign (User interface)

## API Service

A RESTful API provider allows cloients to interact with the server.

-   TypeScript
-   OpenAPI (API definition protocol)
-   Node.js (Backend runtime)
-   Knex.js (Query builder)
-   Express.js (Backend framework)

## Database

Persistent data storage.

PostgreSQL (DBMS)

Docker compose integrate all the service containers.

# Features Overview

## Signup

To sign up, you should enter the registration key, your name and primary contact info. Consider registration key as a whitelist that prevents random users from signing up and accessing everyone’s profile. For demo purpose, you may register by key demoregkey2022. We encourage our users to fill out the college they’re attending although this field is optional.

## Map

After login, you will come to a rollable world map. Each blue sphere represents a location of college where one or more users attend. Hovering your cursor over on blue circles shows user profiles. Feel free to zoom in or out to view the map at different scales.

## Roster

Roster page allows you to 1) search a user by keywords (name, phone number, major, etc), and 2) view users profile through optioanl filters. Note that per the Privacy Agreement, a user can decide whether their profile is visibile to other users. You may or may not see another user’s profile depending on the visibity level they configured. If you can view a user’s profile, that means they’ve set up their visibility scope where your account is included.

## Feedback

Users may communicate with administrators or developers by sending feedback. You can track the feedback status. Kindly pay attention to your email or text message as our admins or developers may reach out to you. If you forget the password, or find a bug, feel free to send us feedbacks.

## Management

An admin user can manage the regular users through management page. An admin user can generate registration keys, edit regular users’ profiles who are under their mangement scope, reset or remove their accounts. The demo user has administrative privileges for illustrative purpose.

## Profile Settings

You can modify personal information, configure profile visibility type, update the password, or remove account from our site.
