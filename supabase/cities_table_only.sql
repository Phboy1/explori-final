-- Run this in Supabase → SQL Editor if you see:
-- "Could not find the table 'public.cities' in the schema cache"
-- Safe to run more than once (uses IF NOT EXISTS + ON CONFLICT).

create table if not exists public.cities (
  id text primary key,
  city_name text not null,
  country text not null,
  avg_cost_index integer not null default 5,
  vibe_tags text not null default '',
  food_scene text not null default 'mixed',
  safety_score integer not null default 5,
  popularity_score integer not null default 5,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;

drop policy if exists "cities_select_all" on public.cities;
create policy "cities_select_all"
  on public.cities for select
  using (true);

insert into public.cities (id, city_name, country, avg_cost_index, vibe_tags, food_scene, safety_score, popularity_score, latitude, longitude) values
  ('toronto-canada', 'Toronto', 'Canada', 7, 'culture,food,city', 'mixed', 8, 9, 43.65107, -79.347015),
  ('new-york-usa', 'New York', 'USA', 9, 'city,food,luxury', 'fine dining', 7, 10, 40.7128, -74.006),
  ('paris-france', 'Paris', 'France', 8, 'culture,luxury,food', 'fine dining', 6, 10, 48.8566, 2.3522),
  ('tokyo-japan', 'Tokyo', 'Japan', 8, 'culture,food,city', 'mixed', 9, 9, 35.6762, 139.6503),
  ('barcelona-spain', 'Barcelona', 'Spain', 6, 'party,culture,food', 'street food', 7, 9, 41.3851, 2.1734),
  ('lisbon-portugal', 'Lisbon', 'Portugal', 5, 'chill,culture,food', 'street food', 8, 8, 38.7223, -9.1393),
  ('berlin-germany', 'Berlin', 'Germany', 6, 'party,culture,city', 'street food', 7, 8, 52.52, 13.405),
  ('vancouver-canada', 'Vancouver', 'Canada', 8, 'nature,culture,chill', 'mixed', 8, 7, 49.2827, -123.1207),
  ('austin-usa', 'Austin', 'USA', 6, 'party,food,chill', 'street food', 6, 7, 30.2672, -97.7431),
  ('miami-usa', 'Miami', 'USA', 8, 'party,luxury,beach', 'fine dining', 5, 8, 25.7617, -80.1918),
  ('portland-usa', 'Portland', 'USA', 6, 'chill,nature,food', 'mixed', 6, 6, 45.5152, -122.6784),
  ('reykjavik-iceland', 'Reykjavik', 'Iceland', 9, 'nature,chill,culture', 'fine dining', 9, 6, 64.1466, -21.9426),
  ('singapore-singapore', 'Singapore', 'Singapore', 9, 'city,food,luxury', 'mixed', 9, 8, 1.3521, 103.8198),
  ('melbourne-australia', 'Melbourne', 'Australia', 7, 'culture,food,chill', 'fine dining', 8, 7, -37.8136, 144.9631),
  ('mexico-city-mexico', 'Mexico City', 'Mexico', 4, 'culture,food,party', 'street food', 4, 8, 19.4326, -99.1332),
  ('amsterdam-netherlands', 'Amsterdam', 'Netherlands', 8, 'party,culture,city', 'mixed', 7, 9, 52.3676, 4.9041),
  ('kyoto-japan', 'Kyoto', 'Japan', 6, 'culture,chill,nature', 'fine dining', 9, 7, 35.0116, 135.7681),
  ('cape-town-south-africa', 'Cape Town', 'South Africa', 5, 'nature,culture,chill', 'mixed', 4, 7, -33.9249, 18.4241),
  ('dublin-ireland', 'Dublin', 'Ireland', 7, 'party,culture,chill', 'mixed', 7, 6, 53.3498, -6.2603),
  ('bangkok-thailand', 'Bangkok', 'Thailand', 3, 'street,food,party', 'street food', 5, 9, 13.7563, 100.5018),
  ('hamilton-canada', 'Hamilton', 'Canada', 6, 'nature,culture,chill', 'mixed', 8, 6, 43.2557, -79.8711),
  ('brampton-canada', 'Brampton', 'Canada', 6, 'culture,food,chill', 'mixed', 7, 6, 43.7315, -79.7624),
  ('mississauga-canada', 'Mississauga', 'Canada', 7, 'culture,food,city', 'mixed', 8, 7, 43.589, -79.6441),
  ('oakville-canada', 'Oakville', 'Canada', 7, 'nature,culture,chill', 'mixed', 9, 6, 43.4675, -79.6877),
  ('ottawa-canada', 'Ottawa', 'Canada', 7, 'culture,chill,city', 'mixed', 9, 7, 45.4215, -75.6972)
on conflict (id) do update set
  city_name = excluded.city_name,
  country = excluded.country,
  avg_cost_index = excluded.avg_cost_index,
  vibe_tags = excluded.vibe_tags,
  food_scene = excluded.food_scene,
  safety_score = excluded.safety_score,
  popularity_score = excluded.popularity_score,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

-- If PostgREST still caches the old schema, wait ~1 min or restart the project from Dashboard.
