-- 마이그레이션: update_schema_to_v2
-- 생성 시간: 2025-09-04 22:15:57

-- 업그레이드
-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS genSettings CASCADE;
DROP TABLE IF EXISTS myTodolist CASCADE;
DROP TABLE IF EXISTS noteLib CASCADE;
DROP TABLE IF EXISTS mylibitems CASCADE;
DROP TABLE IF EXISTS mylib CASCADE;
DROP TABLE IF EXISTS pnote_citations CASCADE;
DROP TABLE IF EXISTS mycitations CASCADE;
DROP TABLE IF EXISTS pnote_history CASCADE;
DROP TABLE IF EXISTS clbcomments CASCADE;
DROP TABLE IF EXISTS prjuser CASCADE;
DROP TABLE IF EXISTS format_rules CASCADE;
DROP TABLE IF EXISTS format_categories CASCADE;
DROP TABLE IF EXISTS proNote CASCADE;
DROP TABLE IF EXISTS myStyles CASCADE;
DROP TABLE IF EXISTS myTempletes CASCADE;
DROP TABLE IF EXISTS proNodes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing ENUM types
DROP TYPE IF EXISTS project_visibility CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS node_type CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;
DROP TYPE IF EXISTS team_role CASCADE;
DROP TYPE IF EXISTS permission_type CASCADE;

-- Drop existing extensions if they exist
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Create new schema based on dbTablev2.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users
CREATE TABLE users (
    uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    uemail VARCHAR(150) NOT NULL UNIQUE,
    upassword VARCHAR(50),
    urole VARCHAR(50) DEFAULT 'user',
    uavatar TEXT,
    ucreate_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ulast_login TIMESTAMPTZ,
    uupdated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for uemail for faster lookups
CREATE INDEX idx_users_uemail ON users (uemail);

-- projects
CREATE TABLE projects (
    prjID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    crtID uuid NOT NULL REFERENCES users(uid),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    proTag TEXT,
    proKey TEXT,
    visibility VARCHAR(50) NOT NULL DEFAULT 'team',
    status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for crtID (Foreign Key)
CREATE INDEX idx_projects_crtid ON projects (crtID);
-- Index for title for common searches
CREATE INDEX idx_projects_title ON projects (title);

-- proNodes
CREATE TABLE proNodes (
    nodeID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    prjID_parents uuid REFERENCES proNodes(nodeID),
    type VARCHAR(50) NOT NULL DEFAULT 'folder',
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for prjID (Foreign Key)
CREATE INDEX idx_pronodes_prjid ON proNodes (prjID);
-- Index for prjID_parents (Foreign Key for self-referencing)
CREATE INDEX idx_pronodes_prjid_parents ON proNodes (prjID_parents);
-- Index for type and title for common filtering
CREATE INDEX idx_pronodes_type_title ON proNodes (type, title);

-- myTempletes
CREATE TABLE myTempletes (
    tmpID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmpkind VARCHAR(255),
    tmpdescription TEXT,
    tmpDisplay_order INTEGER DEFAULT 0,
    tmpCreated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tmpUpdated_at TIMESTAMP
);

-- Index for tmpkind
CREATE INDEX idx_mytempletes_tmpkind ON myTempletes (tmpkind);

-- myStyles
CREATE TABLE myStyles (
    style_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    style_name VARCHAR(100) NOT NULL,
    style_name_en VARCHAR(100),
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for style_name
CREATE INDEX idx_mystyles_style_name ON myStyles (style_name);

-- proNote
CREATE TABLE proNote (
    noteID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nodeID uuid NOT NULL REFERENCES proNodes(nodeID),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    note_Descrtion TEXT,
    crtID uuid NOT NULL REFERENCES users(uid),
    status BOOLEAN DEFAULT true,
    create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    endDate DATE,
    saveYear INTEGER,
    saveStatus BOOLEAN DEFAULT true,
    tmpID uuid NOT NULL REFERENCES myTempletes(tmpID),
    style_id uuid NOT NULL REFERENCES myStyles(style_id)
);

-- Index for nodeID (Foreign Key)
CREATE INDEX idx_pronote_nodeid ON proNote (nodeID);
-- Index for prjID (Foreign Key)
CREATE INDEX idx_pronote_prjid ON proNote (prjID);
-- Index for crtID (Foreign Key)
CREATE INDEX idx_pronote_crtid ON proNote (crtID);
-- Index for tmpID (Foreign Key)
CREATE INDEX idx_pronote_tmpid ON proNote (tmpID);
-- Index for style_id (Foreign Key)
CREATE INDEX idx_pronote_style_id ON proNote (style_id);
-- Index for saveYear and status for common filtering
CREATE INDEX idx_pronote_saveyear_status ON proNote (saveYear, saveStatus);

-- format_categories
CREATE TABLE format_categories (
    category_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    style_id uuid NOT NULL REFERENCES myStyles(style_id),
    category_name VARCHAR(50) NOT NULL,
    category_name_en VARCHAR(50),
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for style_id (Foreign Key)
CREATE INDEX idx_format_categories_style_id ON format_categories (style_id);
-- Index for category_name and is_active for common filtering
CREATE INDEX idx_format_categories_name_active ON format_categories (category_name, is_active);

-- format_rules
CREATE TABLE format_rules (
    rule_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid NOT NULL REFERENCES format_categories(category_id),
    style_id uuid NOT NULL REFERENCES myStyles(style_id),
    element_name VARCHAR(100) NOT NULL,
    element_name_en VARCHAR(100),
    element_code VARCHAR(50),
    setting_value TEXT NOT NULL,
    example_note TEXT,
    css_selector VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for category_id (Foreign Key)
CREATE INDEX idx_format_rules_category_id ON format_rules (category_id);
-- Index for style_id (Foreign Key)
CREATE INDEX idx_format_rules_style_id ON format_rules (style_id);
-- Index for element_name and is_active for common filtering
CREATE INDEX idx_format_rules_element_name_active ON format_rules (element_name, is_active);

-- prjuser
CREATE TABLE prjuser (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    role VARCHAR(50) DEFAULT 'reader',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for prjID (Foreign Key)
CREATE INDEX idx_prjuser_prjid ON prjuser (prjID);
-- Index for role for common filtering
CREATE INDEX idx_prjuser_role ON prjuser (role);

-- clbcomments
CREATE TABLE clbcomments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    noteID uuid NOT NULL REFERENCES proNote(noteID),
    nodeID uuid NOT NULL REFERENCES proNodes(nodeID),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    comment_id uuid NOT NULL,
    ctDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ctState VARCHAR(20) DEFAULT 'begin',
    ctUpdate TIMESTAMPTZ,
    ctEndDate TIMESTAMPTZ,
    cCompleteID uuid
);

-- Index for noteID (Foreign Key)
CREATE INDEX idx_clbcomments_noteid ON clbcomments (noteID);
-- Index for nodeID (Foreign Key)
CREATE INDEX idx_clbcomments_nodeid ON clbcomments (nodeID);
-- Index for prjID (Foreign Key)
CREATE INDEX idx_clbcomments_prjid ON clbcomments (prjID);
-- Index for comment_id
CREATE INDEX idx_clbcomments_comment_id ON clbcomments (comment_id);
-- Index for ctState for filtering by comment status
CREATE INDEX idx_clbcomments_ctstate ON clbcomments (ctState);

-- pnote_history
CREATE TABLE pnote_history (
    phID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    noteID uuid NOT NULL REFERENCES proNote(noteID),
    nodeID uuid NOT NULL REFERENCES proNodes(nodeID),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    phUserID uuid NOT NULL REFERENCES users(uid),
    phModify TEXT,
    phText TEXT,
    phModifySRange INTEGER DEFAULT 0,
    phModifyERange INTEGER DEFAULT 0,
    phModifyDate TIMESTAMPTZ,
    phCreateDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for noteID (Foreign Key)
CREATE INDEX idx_pnote_history_noteid ON pnote_history (noteID);
-- Index for nodeID (Foreign Key)
CREATE INDEX idx_pnote_history_nodeid ON pnote_history (nodeID);
-- Index for prjID (Foreign Key)
CREATE INDEX idx_pnote_history_prjid ON pnote_history (prjID);
-- Index for phUserID (Foreign Key)
CREATE INDEX idx_pnote_history_phuserid ON pnote_history (phUserID);
-- Index for phCreateDate for chronological queries
CREATE INDEX idx_pnote_history_phcreatedate ON pnote_history (phCreateDate);

-- mycitations
CREATE TABLE mycitations (
    mcID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mcName TEXT NOT NULL,
    mcAuthors TEXT NOT NULL,
    mcPublicationyear INTEGER NOT NULL,
    mcSource_type VARCHAR(20) NOT NULL,
    mcPublisher VARCHAR(200),
    mcJorunalNm VARCHAR(200),
    mcVolume VARCHAR(200),
    mcIssue VARCHAR(200),
    mcPages VARCHAR(200),
    mcUrl TEXT,
    mcAccess_date DATE,
    mcDoi VARCHAR(200),
    mcNotes TEXT,
    mcCreated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mcUpdated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for mcName for searching citations
CREATE INDEX idx_mycitations_mcname ON mycitations (mcName);
-- Index for mcAuthors and mcPublicationyear for common searches
CREATE INDEX idx_mycitations_authors_year ON mycitations (mcAuthors, mcPublicationyear);
-- Index for mcSource_type
CREATE INDEX idx_mycitations_sourcetype ON mycitations (mcSource_type);

-- pnote_citations
CREATE TABLE pnote_citations (
    npcID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    citation_id uuid NOT NULL,
    noteID uuid NOT NULL REFERENCES proNote(noteID),
    nodeID uuid NOT NULL REFERENCES proNodes(nodeID),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    npcStNum INTEGER,
    npcEdNum INTEGER,
    npcStatus BOOLEAN DEFAULT true,
    npcCitationID uuid,
    npcCtDate DATE DEFAULT CURRENT_DATE
);

-- Adding the foreign key constraint for citation_id referencing mycitations
ALTER TABLE pnote_citations
ADD CONSTRAINT fk_pnote_citations_citation_id FOREIGN KEY (citation_id) REFERENCES mycitations(mcID);

-- Index for citation_id (Foreign Key to mycitations)
CREATE INDEX idx_pnote_citations_citation_id ON pnote_citations (citation_id);
-- Index for noteID (Foreign Key)
CREATE INDEX idx_pnote_citations_noteid ON pnote_citations (noteID);
-- Index for nodeID (Foreign Key)
CREATE INDEX idx_pnote_citations_nodeid ON pnote_citations (nodeID);
-- Index for prjID (Foreign Key)
CREATE INDEX idx_pnote_citations_prjid ON pnote_citations (prjID);
-- Index for npcStatus for filtering
CREATE INDEX idx_pnote_citations_status ON pnote_citations (npcStatus);

-- mylib
CREATE TABLE mylib (
    mlID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mlTitle TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT,
    author TEXT,
    publisher VARCHAR(200),
    published_date DATE,
    accessed_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Index for mlTitle for searching library items
CREATE INDEX idx_mylib_mltitle ON mylib (mlTitle);
-- Index for type for filtering library items
CREATE INDEX idx_mylib_type ON mylib (type);
-- Index for author for searching
CREATE INDEX idx_mylib_author ON mylib (author);

-- mylibitems
CREATE TABLE mylibitems (
    item_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    mlID uuid NOT NULL REFERENCES mylib(mlID),
    item_type VARCHAR(20) NOT NULL DEFAULT 'file',
    title TEXT NOT NULL,
    url TEXT,
    content JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Index for mlID (Foreign Key)
CREATE INDEX idx_mylibitems_mlid ON mylibitems (mlID);
-- Index for item_type and title for common filtering and searching
CREATE INDEX idx_mylibitems_type_title ON mylibitems (item_type, title);

-- noteLib
CREATE TABLE noteLib (
    ntlID uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    noteID uuid NOT NULL REFERENCES proNote(noteID),
    nodeID uuid NOT NULL REFERENCES proNodes(nodeID),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    mlID uuid NOT NULL REFERENCES mylib(mlID),
    ntlKind VARCHAR(20),
    ntlSAply INTEGER DEFAULT 0,
    ntlEAply INTEGER DEFAULT 0,
    ntlDescrption TEXT,
    ntlUserID uuid NOT NULL REFERENCES users(uid),
    ntlDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for noteID (Foreign Key)
CREATE INDEX idx_notelib_noteid ON noteLib (noteID);
-- Index for nodeID (Foreign Key)
CREATE INDEX idx_notelib_nodeid ON noteLib (nodeID);
-- Index for prjID (Foreign Key)
CREATE INDEX idx_notelib_prjid ON noteLib (prjID);
-- Index for mlID (Foreign Key)
CREATE INDEX idx_notelib_mlid ON noteLib (mlID);
-- Index for ntlUserID (Foreign Key)
CREATE INDEX idx_notelib_ntluserid ON noteLib (ntlUserID);
-- Index for ntlKind for filtering
CREATE INDEX idx_notelib_ntlkind ON noteLib (ntlKind);

-- myTodolist
CREATE TABLE myTodolist (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid uuid NOT NULL REFERENCES users(uid),
    prjID uuid NOT NULL REFERENCES projects(prjID),
    todoDspOrder INTEGER NOT NULL DEFAULT 0,
    todoPriority VARCHAR(20) NOT NULL,
    todoDsc TEXT,
    todoCreateDT TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    todoSttDT TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    todoUpdateDT TIMESTAMPTZ,
    todoEndDT TIMESTAMPTZ,
    todoStatue BOOLEAN DEFAULT true
);

-- Index for uid (Foreign Key)
CREATE INDEX idx_mytodolist_uid ON myTodolist (uid);
-- Index for prjID (Foreign Key)
CREATE INDEX idx_mytodolist_prjid ON myTodolist (prjID);
-- Index for todoStatue and todoPriority for common filtering
CREATE INDEX idx_mytodolist_status_priority ON myTodolist (todoStatue, todoPriority);
-- Index for todoEndDT for sorting and filtering by due date
CREATE INDEX idx_mytodolist_enddt ON myTodolist (todoEndDT);

-- genSettings
CREATE TABLE genSettings (
    gstkeyid VARCHAR(20) PRIMARY KEY DEFAULT '0000',
    gstkind VARCHAR(20) NOT NULL DEFAULT 'user',
    uid uuid NOT NULL REFERENCES users(uid),
    gstname VARCHAR(200),
    gstvalue TEXT NOT NULL,
    gsttype VARCHAR(50),
    gstcategory VARCHAR(50),
    gstdescription TEXT,
    gstisactive BOOLEAN DEFAULT true,
    gstcreated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    gstupdated_at TIMESTAMPTZ
);

-- Index for uid (Foreign Key)
CREATE INDEX idx_gensettings_uid ON genSettings (uid);
-- Index for gstkind, gsttype, gstcategory for common filtering
CREATE INDEX idx_gensettings_kind_type_category ON genSettings (gstkind, gsttype, gstcategory);
-- Index for gstname for direct lookups
CREATE INDEX idx_gensettings_gstname ON genSettings (gstname);

-- 롤백
-- Drop all new tables in reverse dependency order
DROP TABLE IF EXISTS genSettings CASCADE;
DROP TABLE IF EXISTS myTodolist CASCADE;
DROP TABLE IF EXISTS noteLib CASCADE;
DROP TABLE IF EXISTS mylibitems CASCADE;
DROP TABLE IF EXISTS mylib CASCADE;
DROP TABLE IF EXISTS pnote_citations CASCADE;
DROP TABLE IF EXISTS mycitations CASCADE;
DROP TABLE IF EXISTS pnote_history CASCADE;
DROP TABLE IF EXISTS clbcomments CASCADE;
DROP TABLE IF EXISTS prjuser CASCADE;
DROP TABLE IF EXISTS format_rules CASCADE;
DROP TABLE IF EXISTS format_categories CASCADE;
DROP TABLE IF EXISTS proNote CASCADE;
DROP TABLE IF EXISTS myStyles CASCADE;
DROP TABLE IF EXISTS myTempletes CASCADE;
DROP TABLE IF EXISTS proNodes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate original schema (basic tables from initial migration)
-- This would need to be populated with the original schema if rollback is needed
