create table if not exists visits (
  id serial primary key,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists visits_created_at_idx on visits (created_at desc);
create index if not exists visits_path_idx on visits (path);
