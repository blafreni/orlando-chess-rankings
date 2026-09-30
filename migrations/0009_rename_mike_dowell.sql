-- Mike Dowell is the same person as Mike D. Keep Mike (Staff) separate.

delete from players p
where p.name = 'Mike D'
  and exists (select 1 from players d where d.name = 'Mike Dowell')
  and not exists (
    select 1 from games g where g.white_id = p.id or g.black_id = p.id
  );

update players
set name = 'Mike D'
where name = 'Mike Dowell';
