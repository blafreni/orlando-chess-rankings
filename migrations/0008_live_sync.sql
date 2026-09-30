-- Copy live orlandochessrankings.com roster/games as of 11 Sep 2026.

insert into clubs (name, location, meets, meets_weekday)
select 'BarkHaven Chess Club', 'Barkhaven', 'Tuesdays 6:00–9:00', 2
where not exists (select 1 from clubs where lower(name) = 'barkhaven chess club');

insert into clubs (name, location, meets, meets_weekday)
select 'Tin & Taco Chess Club', 'Tin & Taco SODO', 'Thursdays 6:00–10:00', 4
where not exists (select 1 from clubs where lower(name) = 'tin & taco chess club');

insert into players (name, created_at)
select name, created_at
from (
  values
    ('Randy', timestamptz '2026-09-08 18:00:00-04'),
    ('Nate', timestamptz '2026-09-08 18:01:00-04'),
    ('Maurice', timestamptz '2026-09-08 18:02:00-04'),
    ('Mustafa', timestamptz '2026-09-08 18:03:00-04'),
    ('George', timestamptz '2026-09-08 18:04:00-04'),
    ('Florin', timestamptz '2026-09-08 18:05:00-04')
) as incoming(name, created_at)
where not exists (
  select 1 from players p where p.name = incoming.name
);

insert into games (white_id, black_id, result, played_on, created_at, club_id)
select
  (select id from players where name = white_name),
  (select id from players where name = black_name),
  result,
  played_on,
  created_at,
  (select id from clubs where lower(name) = 'friday chess club' limit 1)
from (
  values
    -- Tue, Sep 8 (recorded oldest → newest)
    ('Ben', 'Randy', 'white', date '2026-09-08', timestamptz '2026-09-08 18:10:00-04'),
    ('Randy', 'Ben', 'white', date '2026-09-08', timestamptz '2026-09-08 18:11:00-04'),
    ('Ben', 'Randy', 'black', date '2026-09-08', timestamptz '2026-09-08 18:12:00-04'),
    ('Ben', 'Randy', 'white', date '2026-09-08', timestamptz '2026-09-08 18:13:00-04'),
    ('Randy', 'Ben', 'white', date '2026-09-08', timestamptz '2026-09-08 18:14:00-04'),
    ('Ben', 'Randy', 'white', date '2026-09-08', timestamptz '2026-09-08 18:15:00-04'),
    ('Ben', 'Al', 'white', date '2026-09-08', timestamptz '2026-09-08 18:16:00-04'),
    ('Ben', 'Nate', 'black', date '2026-09-08', timestamptz '2026-09-08 18:17:00-04'),
    ('Ben', 'Nate', 'black', date '2026-09-08', timestamptz '2026-09-08 18:18:00-04'),
    ('Ben', 'Nate', 'white', date '2026-09-08', timestamptz '2026-09-08 18:19:00-04'),
    ('Vince Bercx', 'Maurice', 'white', date '2026-09-08', timestamptz '2026-09-08 18:20:00-04'),
    ('Maurice', 'Vince Bercx', 'black', date '2026-09-08', timestamptz '2026-09-08 18:21:00-04'),
    ('Vince Bercx', 'Mustafa', 'draw', date '2026-09-08', timestamptz '2026-09-08 18:22:00-04'),
    ('Mustafa', 'Vince Bercx', 'black', date '2026-09-08', timestamptz '2026-09-08 18:23:00-04'),
    ('Vince Bercx', 'Nate', 'white', date '2026-09-08', timestamptz '2026-09-08 18:24:00-04'),
    ('Nate', 'Vince Bercx', 'white', date '2026-09-08', timestamptz '2026-09-08 18:25:00-04'),
    ('Vince Bercx', 'George', 'white', date '2026-09-08', timestamptz '2026-09-08 18:26:00-04'),
    ('George', 'Vince Bercx', 'black', date '2026-09-08', timestamptz '2026-09-08 18:27:00-04'),
    ('Florin', 'Norbert', 'black', date '2026-09-08', timestamptz '2026-09-08 18:28:00-04'),
    ('Pat', 'Norbert', 'black', date '2026-09-08', timestamptz '2026-09-08 18:29:00-04'),
    -- Wed, Sep 9
    ('Vince Bercx', 'Mike D', 'white', date '2026-09-09', timestamptz '2026-09-09 16:10:00-04'),
    ('Mike D', 'Vince Bercx', 'black', date '2026-09-09', timestamptz '2026-09-09 16:11:00-04'),
    -- Fri, Sep 11
    ('Al', 'Ben', 'white', date '2026-09-11', timestamptz '2026-09-11 12:10:00-04'),
    ('Ben', 'Al', 'white', date '2026-09-11', timestamptz '2026-09-11 12:11:00-04'),
    ('Al', 'Ben', 'black', date '2026-09-11', timestamptz '2026-09-11 12:12:00-04'),
    ('John Snow', 'Pat', 'black', date '2026-09-11', timestamptz '2026-09-11 12:13:00-04'),
    ('Norbert', 'Ben', 'white', date '2026-09-11', timestamptz '2026-09-11 12:14:00-04'),
    ('Ben', 'Norbert', 'black', date '2026-09-11', timestamptz '2026-09-11 12:15:00-04'),
    ('Norbert', 'Ben', 'white', date '2026-09-11', timestamptz '2026-09-11 12:16:00-04'),
    ('Fernando', 'Norbert', 'white', date '2026-09-11', timestamptz '2026-09-11 12:17:00-04'),
    ('Al', 'Norbert', 'draw', date '2026-09-11', timestamptz '2026-09-11 12:18:00-04')
) as incoming(white_name, black_name, result, played_on, created_at)
where not exists (
  select 1 from games where played_on > date '2026-09-04'
);
