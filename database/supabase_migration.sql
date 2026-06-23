-- ============================================================================
-- SUPABASE MIGRATION: Employee Leave Management System
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- 1. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            TEXT        NOT NULL,
    email           TEXT        NOT NULL UNIQUE,
    role            TEXT        NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    team            TEXT        NOT NULL DEFAULT '-',
    position        TEXT        NOT NULL DEFAULT 'Staff',
    join_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
    leave_balance   INTEGER     NOT NULL DEFAULT 12,
    status          TEXT        NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TEAMS
CREATE TABLE IF NOT EXISTS teams (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            TEXT        NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TEAM_PICS
CREATE TABLE IF NOT EXISTS team_pics (
    id              SERIAL      PRIMARY KEY,
    team_id         TEXT        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    employee_id     TEXT        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, employee_id)
);

-- 4. LEAVE_REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
    id                      TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id             TEXT        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type                    TEXT        NOT NULL CHECK (type IN ('ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'IMPORTANT')),
    start_date              DATE        NOT NULL,
    end_date                DATE        NOT NULL,
    duration_days           INTEGER     NOT NULL DEFAULT 1,
    reason                  TEXT        NOT NULL,
    status                  TEXT        NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    requested_approver_id   TEXT        REFERENCES employees(id) ON DELETE SET NULL,
    approved_by             TEXT        REFERENCES employees(id) ON DELETE SET NULL,
    approved_at             TIMESTAMPTZ,
    approver_feedback       TEXT,
    attachment_name         TEXT,
    attachment_url          TEXT,
    attachment_size         INTEGER,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_team ON employees(team);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_team_pics_team ON team_pics(team_id);

-- 6. RLS (Row Level Security) - Disable for simplicity (app handles auth)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_pics ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (since app manages its own auth)
CREATE POLICY "Allow all for anon" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON team_pics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON leave_requests FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- SEED DATA
-- ============================================================================

-- System Administrator
INSERT INTO employees (id, name, email, role, team, position, join_date, leave_balance, status) VALUES
('admin-uuid-1234-5678', 'System Administrator', 'admin@company.com', 'ADMIN', '-', 'Administrator', '2020-01-01', 0, 'ACTIVE');

-- Team RPA
INSERT INTO employees (id, name, email, role, team, position, join_date, leave_balance, status) VALUES
('rpa-001', 'Andi Wijaya',       'andi.wijaya@company.com',       'EMPLOYEE', 'RPA', 'Manager',    '2021-03-15', 12, 'ACTIVE'),
('rpa-002', 'Budi Santoso',      'budi.santoso@company.com',      'EMPLOYEE', 'RPA', 'Supervisor', '2021-06-01', 12, 'ACTIVE'),
('rpa-003', 'Citra Dewi',        'citra.dewi@company.com',        'EMPLOYEE', 'RPA', 'Supervisor', '2022-01-10', 12, 'ACTIVE'),
('rpa-004', 'Dian Pratama',      'dian.pratama@company.com',       'EMPLOYEE', 'RPA', 'Staff',      '2022-04-01', 12, 'ACTIVE'),
('rpa-005', 'Eko Prasetyo',      'eko.prasetyo@company.com',       'EMPLOYEE', 'RPA', 'Staff',      '2022-07-15', 12, 'ACTIVE'),
('rpa-006', 'Fitri Handayani',   'fitri.handayani@company.com',    'EMPLOYEE', 'RPA', 'Staff',      '2023-01-05', 12, 'ACTIVE'),
('rpa-007', 'Gilang Ramadhan',   'gilang.ramadhan@company.com',    'EMPLOYEE', 'RPA', 'Staff',      '2023-03-20', 12, 'ACTIVE'),
('rpa-008', 'Hana Kartika',      'hana.kartika@company.com',       'EMPLOYEE', 'RPA', 'Staff',      '2023-06-10', 12, 'ACTIVE'),
('rpa-009', 'Ivan Setiawan',     'ivan.setiawan@company.com',      'EMPLOYEE', 'RPA', 'Staff',      '2024-01-08', 12, 'ACTIVE'),
('rpa-010', 'Jasmine Putri',     'jasmine.putri@company.com',      'EMPLOYEE', 'RPA', 'Staff',      '2024-04-15', 12, 'ACTIVE');

-- Team ELCAP
INSERT INTO employees (id, name, email, role, team, position, join_date, leave_balance, status) VALUES
('elcap-001', 'Kevin Hartono',     'kevin.hartono@company.com',     'EMPLOYEE', 'ELCAP', 'Manager',    '2021-02-01', 12, 'ACTIVE'),
('elcap-002', 'Lisa Anggraeni',    'lisa.anggraeni@company.com',    'EMPLOYEE', 'ELCAP', 'Supervisor', '2021-05-10', 12, 'ACTIVE'),
('elcap-003', 'Muhammad Rizki',    'muhammad.rizki@company.com',    'EMPLOYEE', 'ELCAP', 'Supervisor', '2022-02-14', 12, 'ACTIVE'),
('elcap-004', 'Nadia Sari',        'nadia.sari@company.com',        'EMPLOYEE', 'ELCAP', 'Staff',      '2022-05-01', 12, 'ACTIVE'),
('elcap-005', 'Oscar Firmansyah',  'oscar.firmansyah@company.com',  'EMPLOYEE', 'ELCAP', 'Staff',      '2022-08-20', 12, 'ACTIVE'),
('elcap-006', 'Putri Rahayu',      'putri.rahayu@company.com',      'EMPLOYEE', 'ELCAP', 'Staff',      '2023-01-15', 12, 'ACTIVE'),
('elcap-007', 'Qori Fadillah',     'qori.fadillah@company.com',     'EMPLOYEE', 'ELCAP', 'Staff',      '2023-04-01', 12, 'ACTIVE'),
('elcap-008', 'Rendi Kurniawan',   'rendi.kurniawan@company.com',   'EMPLOYEE', 'ELCAP', 'Staff',      '2023-07-10', 12, 'ACTIVE'),
('elcap-009', 'Sinta Maharani',    'sinta.maharani@company.com',    'EMPLOYEE', 'ELCAP', 'Staff',      '2024-02-01', 12, 'ACTIVE'),
('elcap-010', 'Taufik Hidayat',    'taufik.hidayat@company.com',    'EMPLOYEE', 'ELCAP', 'Staff',      '2024-05-20', 12, 'ACTIVE');

-- Team ECM
INSERT INTO employees (id, name, email, role, team, position, join_date, leave_balance, status) VALUES
('ecm-001', 'Umar Faruq',       'umar.faruq@company.com',       'EMPLOYEE', 'ECM', 'Manager',    '2021-01-15', 12, 'ACTIVE'),
('ecm-002', 'Vina Oktavia',     'vina.oktavia@company.com',      'EMPLOYEE', 'ECM', 'Supervisor', '2021-04-20', 12, 'ACTIVE'),
('ecm-003', 'Wahyu Nugroho',    'wahyu.nugroho@company.com',     'EMPLOYEE', 'ECM', 'Supervisor', '2022-03-01', 12, 'ACTIVE'),
('ecm-004', 'Xena Permata',     'xena.permata@company.com',      'EMPLOYEE', 'ECM', 'Staff',      '2022-06-15', 12, 'ACTIVE'),
('ecm-005', 'Yusuf Hakim',      'yusuf.hakim@company.com',       'EMPLOYEE', 'ECM', 'Staff',      '2022-09-01', 12, 'ACTIVE'),
('ecm-006', 'Zahra Amelia',     'zahra.amelia@company.com',      'EMPLOYEE', 'ECM', 'Staff',      '2023-02-10', 12, 'ACTIVE'),
('ecm-007', 'Arif Rahman',      'arif.rahman@company.com',       'EMPLOYEE', 'ECM', 'Staff',      '2023-05-15', 12, 'ACTIVE'),
('ecm-008', 'Bella Safitri',    'bella.safitri@company.com',     'EMPLOYEE', 'ECM', 'Staff',      '2023-08-01', 12, 'ACTIVE'),
('ecm-009', 'Cahya Wibowo',     'cahya.wibowo@company.com',      'EMPLOYEE', 'ECM', 'Staff',      '2024-03-01', 12, 'ACTIVE'),
('ecm-010', 'Dewi Lestari',     'dewi.lestari@company.com',      'EMPLOYEE', 'ECM', 'Staff',      '2024-06-10', 12, 'ACTIVE');

-- Teams
INSERT INTO teams (id, name) VALUES
('team-rpa',   'RPA'),
('team-elcap', 'ELCAP'),
('team-ecm',   'ECM');

-- Team PICs
INSERT INTO team_pics (team_id, employee_id) VALUES
('team-rpa', 'rpa-001'), ('team-rpa', 'rpa-002'), ('team-rpa', 'rpa-003'),
('team-elcap', 'elcap-001'), ('team-elcap', 'elcap-002'), ('team-elcap', 'elcap-003'),
('team-ecm', 'ecm-001'), ('team-ecm', 'ecm-002'), ('team-ecm', 'ecm-003');
