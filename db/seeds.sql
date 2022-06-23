-- LOAD TABLES WITH DUMMBY DATA

INSERT INTO department (name)
VALUES ('Finance'),
       ('Software'),
       ('Marketing'),
       ('Customer Service');


INSERT INTO role (title, salary, department_id)
VALUES ('Business Intelligence', 80000, 1),
       ('Financial Analyst', 70000, 1),
       ('Web Developer', 60000, 2),
       ('Graphic Designer', 50000, 3),
       ('Creative Director', 85000, 3),
       ('Operator', 30000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('jeff', 'thomson', 1, NULL),
       ('sally', 'rogers', 2, 1),
       ('tom', 'mawaki', 2, 1),
       ('sarah', 'ongino', 3, 1),
       ('jessica', 'slithna', 4, 3),
       ('morty', 'vanderbilt', 5, 3),
       ('rick', 'paltin', 6, 3);