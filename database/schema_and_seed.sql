-- ============================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM
-- DDL (Data Definition Language) + DML (Data Manipulation Language)
-- Database: PostgreSQL (compatible with MySQL with minor adjustments)
-- Generated: 2026-06-23
-- ============================================================================

-- ============================================================================
-- DDL: CREATE TABLES
-- ============================================================================

-- 1. EMPLOYEES
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    role            VARCHAR(20)     NOT NULL DEFAULT 'EMPLOYEE'
                        CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    team            VARCHAR(50)     NOT NULL DEFAULT '-',
    position        VARCHAR(50)     NOT NULL DEFAULT 'Staff',
    join_date       DATE            NOT NULL DEFAULT CURRENT_DATE,
    leave_balance   INTEGER         NOT NULL DEFAULT 12,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_team ON employees(team);
CREATE INDEX idx_employees_status ON employees(status);


-- 2. TEAMS
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 3. TEAM_PICS (Person In Charge per Team - Many-to-Many)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_pics (
    id              SERIAL          PRIMARY KEY,
    team_id         VARCHAR(50)     NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    employee_id     VARCHAR(50)     NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, employee_id)
);

CREATE INDEX idx_team_pics_team ON team_pics(team_id);
CREATE INDEX idx_team_pics_employee ON team_pics(employee_id);


-- 4. LEAVE_REQUESTS
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
    id                      VARCHAR(50)     PRIMARY KEY,
    employee_id             VARCHAR(50)     NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type                    VARCHAR(20)     NOT NULL
                                CHECK (type IN ('ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'IMPORTANT')),
    start_date              DATE            NOT NULL,
    end_date                DATE            NOT NULL,
    duration_days           INTEGER         NOT NULL DEFAULT 1,
    reason                  TEXT            NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    requested_approver_id   VARCHAR(50)     REFERENCES employees(id) ON DELETE SET NULL,
    approved_by             VARCHAR(50)     REFERENCES employees(id) ON DELETE SET NULL,
    approved_at             TIMESTAMP,
    approver_feedback       TEXT,
    attachment_name         VARCHAR(255),
    attachment_url          TEXT,
    attachment_size         INTEGER,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approver ON leave_requests(requested_approver_id);


-- 5. ACTIVITY_LOGS (Audit Trail)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id              SERIAL          PRIMARY KEY,
    user_id         VARCHAR(50)     NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    action          VARCHAR(50)     NOT NULL,
    target_type     VARCHAR(50),        -- e.g., 'EMPLOYEE', 'LEAVE_REQUEST', 'TEAM'
    target_id       VARCHAR(50),
    description     TEXT,
    metadata        JSONB,              -- Additional data (PostgreSQL), use JSON for MySQL
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);


-- ============================================================================
-- DML: SEED DATA
-- ============================================================================

-- ─── EMPLOYEES (31 total: 1 Admin + 30 Team Members) ───────────────────────

-- System Administrator
INSERT INTO employees (id, name, email, role, team, position, join_date, leave_balance, status) VALUES
('admin-uuid-1234-5678', 'System Administrator', 'admin@company.com', 'ADMIN', '-', 'Administrator', '2020-01-01', 0, 'ACTIVE');

-- Team RPA (10 members)
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

-- Team ELCAP (10 members)
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

-- Team ECM (10 members)
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


-- ─── TEAMS (3 teams) ───────────────────────────────────────────────────────

INSERT INTO teams (id, name) VALUES
('team-rpa',   'RPA'),
('team-elcap', 'ELCAP'),
('team-ecm',   'ECM');


-- ─── TEAM PICs (3 PICs per team = 9 records) ───────────────────────────────

-- RPA PICs: Andi (Manager), Budi (Supervisor), Citra (Supervisor)
INSERT INTO team_pics (team_id, employee_id) VALUES
('team-rpa', 'rpa-001'),
('team-rpa', 'rpa-002'),
('team-rpa', 'rpa-003');

-- ELCAP PICs: Kevin (Manager), Lisa (Supervisor), Muhammad (Supervisor)
INSERT INTO team_pics (team_id, employee_id) VALUES
('team-elcap', 'elcap-001'),
('team-elcap', 'elcap-002'),
('team-elcap', 'elcap-003');

-- ECM PICs: Umar (Manager), Vina (Supervisor), Wahyu (Supervisor)
INSERT INTO team_pics (team_id, employee_id) VALUES
('team-ecm', 'ecm-001'),
('team-ecm', 'ecm-002'),
('team-ecm', 'ecm-003');


-- ─── SAMPLE LEAVE REQUESTS ─────────────────────────────────────────────────

INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, duration_days, reason, status, requested_approver_id, created_at) VALUES
-- RPA team requests
('lr-001', 'rpa-004', 'ANNUAL',    '2026-07-01', '2026-07-03', 3, 'Liburan keluarga ke Bali',              'PENDING',   'rpa-001', '2026-06-20 08:30:00'),
('lr-002', 'rpa-005', 'SICK',      '2026-06-18', '2026-06-19', 2, 'Demam dan flu',                          'APPROVED',  'rpa-002', '2026-06-18 07:00:00'),
('lr-003', 'rpa-007', 'IMPORTANT', '2026-08-15', '2026-08-17', 3, 'Acara pernikahan',                       'PENDING',   'rpa-003', '2026-06-22 10:00:00'),
('lr-004', 'rpa-009', 'ANNUAL',    '2026-06-25', '2026-06-27', 3, 'Pulang kampung',                         'PENDING',   'rpa-001', '2026-06-21 09:15:00'),

-- ELCAP team requests
('lr-005', 'elcap-004', 'ANNUAL',   '2026-07-10', '2026-07-14', 5, 'Vacation ke Jepang',                    'PENDING',   'elcap-001', '2026-06-20 11:00:00'),
('lr-006', 'elcap-006', 'SICK',     '2026-06-19', '2026-06-20', 2, 'Sakit perut, perlu istirahat',           'APPROVED',  'elcap-002', '2026-06-19 06:30:00'),
('lr-007', 'elcap-008', 'UNPAID',   '2026-08-01', '2026-08-05', 5, 'Urusan keluarga mendesak',               'REJECTED',  'elcap-003', '2026-06-15 14:00:00'),

-- ECM team requests
('lr-008', 'ecm-004', 'ANNUAL',    '2026-07-07', '2026-07-09', 3, 'Wisuda adik di Surabaya',                'PENDING',   'ecm-001', '2026-06-22 08:45:00'),
('lr-009', 'ecm-006', 'MATERNITY', '2026-09-01', '2026-11-30', 91, 'Cuti melahirkan',                       'APPROVED',  'ecm-002', '2026-06-10 09:00:00'),
('lr-010', 'ecm-009', 'SICK',      '2026-06-22', '2026-06-22', 1, 'Migrain berat, tidak bisa kerja',        'PENDING',   'ecm-003', '2026-06-22 07:00:00');

-- Update approved requests with approver info
UPDATE leave_requests SET approved_by = 'rpa-002',   approved_at = '2026-06-18 09:00:00', approver_feedback = 'Get well soon' WHERE id = 'lr-002';
UPDATE leave_requests SET approved_by = 'elcap-002', approved_at = '2026-06-19 08:00:00', approver_feedback = 'Semoga lekas sembuh' WHERE id = 'lr-006';
UPDATE leave_requests SET approved_by = 'elcap-003', approved_at = '2026-06-16 10:00:00', approver_feedback = 'Maaf, saldo cuti habis' WHERE id = 'lr-007';
UPDATE leave_requests SET approved_by = 'ecm-002',   approved_at = '2026-06-11 10:00:00', approver_feedback = 'Selamat! Disetujui.' WHERE id = 'lr-009';


-- ============================================================================
-- USEFUL VIEWS (Optional)
-- ============================================================================

-- View: Leave requests with employee & approver names
CREATE OR REPLACE VIEW v_leave_requests AS
SELECT 
    lr.id,
    lr.employee_id,
    e.name AS employee_name,
    e.team AS employee_team,
    e.position AS employee_position,
    lr.type,
    lr.start_date,
    lr.end_date,
    lr.duration_days,
    lr.reason,
    lr.status,
    lr.requested_approver_id,
    ra.name AS requested_approver_name,
    lr.approved_by,
    ab.name AS approved_by_name,
    lr.approved_at,
    lr.approver_feedback,
    lr.created_at
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.id
LEFT JOIN employees ra ON lr.requested_approver_id = ra.id
LEFT JOIN employees ab ON lr.approved_by = ab.id
ORDER BY lr.created_at DESC;

-- View: Team summary with PIC count and member count
CREATE OR REPLACE VIEW v_team_summary AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    COUNT(DISTINCT tp.employee_id) AS pic_count,
    COUNT(DISTINCT e.id) AS member_count,
    STRING_AGG(DISTINCT pic_emp.name, ', ') AS pic_names
FROM teams t
LEFT JOIN team_pics tp ON t.id = tp.team_id
LEFT JOIN employees pic_emp ON tp.employee_id = pic_emp.id
LEFT JOIN employees e ON e.team = t.name
GROUP BY t.id, t.name
ORDER BY t.name;

-- View: Employee leave balance summary
CREATE OR REPLACE VIEW v_employee_leave_summary AS
SELECT 
    e.id,
    e.name,
    e.team,
    e.position,
    e.leave_balance AS total_balance,
    COALESCE(SUM(CASE WHEN lr.status = 'APPROVED' AND lr.type != 'UNPAID' THEN lr.duration_days ELSE 0 END), 0) AS used_days,
    e.leave_balance - COALESCE(SUM(CASE WHEN lr.status = 'APPROVED' AND lr.type != 'UNPAID' THEN lr.duration_days ELSE 0 END), 0) AS remaining_balance,
    COALESCE(SUM(CASE WHEN lr.status = 'PENDING' THEN lr.duration_days ELSE 0 END), 0) AS pending_days
FROM employees e
LEFT JOIN leave_requests lr ON e.id = lr.employee_id
WHERE e.status = 'ACTIVE' AND e.role != 'ADMIN'
GROUP BY e.id, e.name, e.team, e.position, e.leave_balance
ORDER BY e.team, e.name;


-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Login Credentials:
-- ┌────────────────────────────────────┬──────────────┐
-- │ Username / Email                   │ Password     │
-- ├────────────────────────────────────┼──────────────┤
-- │ admin                              │ admin123     │
-- │ andi.wijaya@company.com            │ password123  │
-- │ kevin.hartono@company.com          │ password123  │
-- │ (semua email employee lainnya)     │ password123  │
-- └────────────────────────────────────┴──────────────┘
--
-- Password hashing belum diterapkan (plain text di client-side).
-- Untuk production, gunakan bcrypt atau argon2 untuk hash password.
--
-- Jika menggunakan MySQL, ganti:
--   - SERIAL        → INT AUTO_INCREMENT
--   - JSONB         → JSON
--   - STRING_AGG()  → GROUP_CONCAT()
--   - CREATE OR REPLACE VIEW → CREATE VIEW (drop first)
-- ============================================================================
