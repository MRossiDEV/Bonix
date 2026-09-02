create table public.promos (
id uuid not null default extensions.uuid_generate_v4 (),
merchant_id uuid not null,
title text not null,
description text not null,
original_price numeric(10, 2) not null,
discounted_price numeric(10, 2) not null,
cashback_percent numeric(5, 2) not null,
total_slots integer not null,
available_slots integer not null,
status public.promo_status not null default 'DRAFT'::promo_status,
activated_at timestamp with time zone null,
expires_at timestamp with time zone not null,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
is_featured boolean null default false,
category text null,
image text null,
starts_at timestamp with time zone null,
deleted_at timestamp with time zone null,
activity_state text not null default 'UNACTIVE'::text,
constraint promos_pkey primary key (id),
constraint promos_merchant_id_fkey foreign KEY (merchant_id) references merchants (id) on delete CASCADE,
constraint promos_activity_state_check check (
(
activity_state = any (array['ACTIVE'::text, 'UNACTIVE'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_promos_merchant_id on public.promos using btree (merchant_id) TABLESPACE pg_default;

create index IF not exists idx_promos_status on public.promos using btree (status) TABLESPACE pg_default;

create index IF not exists idx_promos_expires_at on public.promos using btree (expires_at) TABLESPACE pg_default;

create index IF not exists idx_promos_featured on public.promos using btree (is_featured) TABLESPACE pg_default;

create index IF not exists idx_promos_category on public.promos using btree (category) TABLESPACE pg_default;

create index IF not exists idx_promos_available_slots on public.promos using btree (available_slots) TABLESPACE pg_default
where
(available_slots > 0);

create index IF not exists idx_promos_deleted_at on public.promos using btree (deleted_at) TABLESPACE pg_default;

create index IF not exists idx_promos_status_expires on public.promos using btree (status, expires_at) TABLESPACE pg_default;

create index IF not exists idx_promos_activity_state on public.promos using btree (activity_state) TABLESPACE pg_default;

create trigger promo_update_rules BEFORE
update on promos for EACH row
execute FUNCTION enforce_promo_update_rules ();

create trigger sync_promo_status_trigger BEFORE INSERT
or
update on promos for EACH row
execute FUNCTION sync_promo_status ();

create trigger trg_promos_expire BEFORE
update on promos for EACH row
execute FUNCTION expire_promos ();

create trigger trg_promos_sold_out BEFORE
update on promos for EACH row
execute FUNCTION handle_sold_out ();

create trigger trg_promos_updated_at BEFORE
update on promos for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_promos_updated_at BEFORE
update on promos for EACH row
execute FUNCTION update_updated_at_column ();
