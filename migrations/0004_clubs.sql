create table if not exists clubs (
  id serial primary key,
  name text not null,
  location text not null default '',
  meets text not null default '',
  meets_weekday smallint check (meets_weekday is null or (meets_weekday between 0 and 6)),
  created_at timestamptz not null default now()
);

create unique index if not exists clubs_name_lower_idx on clubs (lower(name));

insert into clubs (name, location, meets, meets_weekday)
select 'Friday Chess Club', 'Winter Park Community Center', 'Fridays 12:00–3:00', 5
where not exists (select 1 from clubs where lower(name) = 'friday chess club');

insert into clubs (name, location, meets, meets_weekday)
select 'Colonialtown Saturdays', 'Colonialtown Neighborhood Center', 'Saturdays 12:00–3:00', 6
where not exists (select 1 from clubs where lower(name) in ('colonialtown saturdays', 'orlando chess club'));

insert into clubs (name, location, meets, meets_weekday)
select 'Oviedo Mall Meetup', 'Oviedo Mall Food Court', 'Mondays 6:00–9:00', 1
where not exists (select 1 from clubs where lower(name) = 'oviedo mall meetup');

alter table games add column if not exists club_id int references clubs (id);

update games
set club_id = (select id from clubs where lower(name) = 'friday chess club' limit 1)
where club_id is null;

create index if not exists games_club_id_idx on games (club_id);
