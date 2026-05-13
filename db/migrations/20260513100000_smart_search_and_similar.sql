-- Enable trigram extension for fuzzy/typo-tolerant search
create extension if not exists pg_trgm;

-- GIN index on title for fast trigram lookups
create index if not exists listings_title_trgm_idx
  on public.listings using gin (title gin_trgm_ops);

-- Smart search: exact match first, then fuzzy by trigram similarity
create or replace function search_listings(q text, city text default null)
returns setof public.listings
language sql stable as $$
  select * from public.listings
  where status = 'active'
    and (city is null or location ilike city)
    and (
      title       ilike '%' || q || '%'
      or description ilike '%' || q || '%'
      or word_similarity(q, title) > 0.25
    )
  order by
    case
      when title ilike '%' || q || '%' then 3
      when word_similarity(q, title) > 0.4  then 2
      when word_similarity(q, title) > 0.25 then 1
      else 0
    end desc,
    word_similarity(q, title) desc,
    created_at desc
  limit 60;
$$;

-- Similar listings: title similarity weighted heavier than category
create or replace function similar_listings(p_id uuid, p_title text, p_category text)
returns setof public.listings
language sql stable as $$
  select * from public.listings
  where status = 'active'
    and id != p_id
    and (
      word_similarity(p_title, title) > 0.15
      or category = p_category
    )
  order by
    (word_similarity(p_title, title) * 2.0
      + case when category = p_category then 0.5 else 0.0 end) desc
  limit 8;
$$;
