CREATE TABLE coupons (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code         text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{4,20}$'),
  percent_off  smallint CHECK (percent_off BETWEEN 1 AND 90),
  amount_off   numeric(10, 2) CHECK (amount_off > 0),
  valid_from   date NOT NULL,
  valid_until  date NOT NULL,
  max_uses     integer CHECK (max_uses > 0),
  uses         integer NOT NULL DEFAULT 0 CHECK (uses >= 0),
  CHECK (num_nonnulls(percent_off, amount_off) = 1),
  CHECK (valid_until > valid_from),
  CHECK (uses <= max_uses)
);
