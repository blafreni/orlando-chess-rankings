create table if not exists players (
  id serial primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists players_name_lower_idx on players (lower(name));

create table if not exists games (
  id serial primary key,
  white_id int not null references players (id),
  black_id int not null references players (id),
  result text not null check (result in ('white', 'black', 'draw')),
  played_on date not null,
  created_at timestamptz not null default now(),
  constraint games_two_players check (white_id <> black_id)
);

create index if not exists games_played_on_idx on games (played_on desc, id desc);
create index if not exists games_white_id_idx on games (white_id);
create index if not exists games_black_id_idx on games (black_id);
