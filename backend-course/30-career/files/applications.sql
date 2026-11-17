-- נתוני תרגיל P30-E118 (פרק 30): טבלת מעקב אחרי מועמדויות.
-- טעינה (מתוך ~/dev/backend-course):  psql -d course -f 30-career/files/applications.sql
DROP TABLE IF EXISTS applications;

CREATE TABLE applications (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company     text NOT NULL,
  channel     text NOT NULL CHECK (channel IN ('referral', 'linkedin', 'company_site', 'community')),
  applied_on  date NOT NULL,
  stage       text NOT NULL CHECK (stage IN ('applied', 'screen', 'interview', 'offer', 'rejected'))
);

INSERT INTO applications (company, channel, applied_on, stage) VALUES
  ('Acme',        'referral',     '2026-10-05', 'interview'),
  ('Brew Labs',   'referral',     '2026-10-07', 'screen'),
  ('Cartly',      'referral',     '2026-10-12', 'applied'),
  ('Datafy',      'referral',     '2026-10-20', 'offer'),
  ('Edge Pay',    'linkedin',     '2026-10-02', 'applied'),
  ('Fintrix',     'linkedin',     '2026-10-03', 'applied'),
  ('GoShip',      'linkedin',     '2026-10-04', 'rejected'),
  ('Hivemind',    'linkedin',     '2026-10-09', 'applied'),
  ('Insure.io',   'linkedin',     '2026-10-10', 'applied'),
  ('Jobz',        'linkedin',     '2026-10-15', 'screen'),
  ('Kiwi',        'linkedin',     '2026-10-16', 'applied'),
  ('Loopa',       'linkedin',     '2026-10-22', 'applied'),
  ('Mapster',     'company_site', '2026-10-06', 'applied'),
  ('Nimbus',      'company_site', '2026-10-13', 'rejected'),
  ('Orca',        'company_site', '2026-10-14', 'applied'),
  ('Pixel',       'company_site', '2026-10-21', 'interview'),
  ('Quanta',      'community',    '2026-10-08', 'screen'),
  ('Ravel',       'community',    '2026-10-23', 'applied');
