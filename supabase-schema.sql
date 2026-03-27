create table payments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  tool_id text not null,
  generation_id uuid,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  amount integer not null,
  currency text default 'INR',
  status text default 'pending',
  created_at timestamptz default now()
);

create table unlocks (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  tool_id text not null,
  payment_id uuid references payments(id),
  unlocked_at timestamptz default now(),
  unique(session_id, tool_id)
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  tool_id text not null,
  full_result text,
  input_tokens integer,
  output_tokens integer,
  is_paid boolean default false,
  created_at timestamptz default now()
);

create table tool_stats (
  tool_id text primary key,
  total_views integer default 0,
  total_generations integer default 0,
  total_paid integer default 0,
  total_revenue integer default 0,
  updated_at timestamptz default now()
);

insert into tool_stats (tool_id) values
  ('profile-personality'),
  ('crush-compatibility'),
  ('facebook-prediction'),
  ('profile-impression'),
  ('decode-message'),
  ('friendship-roast'),
  ('instagram-type');
