insert into players (name, created_at)
select 'Mike D', '2026-09-11 17:00:00-04'
where not exists (select 1 from players where name = 'Mike D');
