update clubs
set
  name = 'Colonialtown Saturdays',
  location = 'Colonialtown Neighborhood Center',
  meets = 'Saturdays 12:00–3:00',
  meets_weekday = 6
where lower(name) = 'orlando chess club';

insert into clubs (name, location, meets, meets_weekday)
select 'Winter Park Tuesday Nights', 'AJ''s Chocolate House', 'Tuesdays 6:00–9:00', 2
where not exists (
  select 1 from clubs where lower(name) = 'winter park tuesday nights'
);
