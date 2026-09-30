update clubs
set
  location = 'Winter Park Community Center',
  meets = 'Fridays 12:00–3:00',
  meets_weekday = 5
where lower(name) = 'friday chess club';

update clubs
set
  location = 'AJ''s Chocolate House',
  meets = 'Tuesdays 6:00–9:00',
  meets_weekday = 2
where lower(name) = 'winter park tuesday nights';
