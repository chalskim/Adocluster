-- 마이그레이션: initial_schema_v2
-- 생성 시간: 2025-09-13 15:28:00

-- 업그레이드
-- ENUM 타입 생성
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE project_visibility AS ENUM ('private', 'team', 'company', 'public');
CREATE TYPE prjuser_role AS ENUM ('admin', 'editor', 'reviewer', 'reader');
CREATE TYPE pronode_type AS ENUM ('folder', 'note', 'external');
CREATE TYPE mylibitem_type AS ENUM ('file', 'image', 'table', 'website', 'latex', 'video', 'audio', 'quote');
CREATE TYPE comment_state AS ENUM ('begin', 'progress', 'resolved');

-- 확장 프로그램 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 테이블
CREATE TABLE "user" (
	"uid"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"uemail"	VARCHAR(150)	UNIQUE NOT NULL,
	"upassword"	VARCHAR(50)		NULL,
	"uname"	VARCHAR(100)		NULL,
	"urole"	user_role	DEFAULT 'user',
	"uavatar"	TEXT		NULL,
	"ucreate_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ulast_login"	TIMESTAMPTZ		NULL,
	"uupdated_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
	"uauth"	varchar(10)		NULL,
	"ustate"	BOOLEAN	DEFAULT TRUE
);
CREATE INDEX idx_user_email ON "user"(uemail);

-- 프로젝트 테이블
CREATE TABLE "projects" (
	"prjID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"crtID"	uuid	NOT NULL REFERENCES "user"(uid),
	"title"	VARCHAR(200)	NOT NULL,
	"description"	TEXT,
	"proTag"	TEXT,
	"proKey"	TEXT,
	"visibility"	project_visibility	DEFAULT 'team' NOT NULL,
	"status"	VARCHAR(50),
	"start_date"	DATE,
	"end_date"	DATE,
	"created_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
	"update_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_crtID ON projects("crtID");

-- 프로젝트 사용자 참여 테이블
CREATE TABLE "prjuser" (
	"id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"prjID"	uuid	NOT NULL REFERENCES "projects"(prjID) ON DELETE CASCADE,
    "uid"   uuid    NOT NULL REFERENCES "user"(uid) ON DELETE CASCADE,
	"role"	prjuser_role DEFAULT 'reader',
	"created_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("prjID", "uid")
);
CREATE INDEX idx_prjuser_prjID ON prjuser("prjID");
CREATE INDEX idx_prjuser_uid ON prjuser("uid");

-- 노트 원본 테이블
CREATE TABLE "note" (
	"note_id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"note_text"	jsonb,
	"note_sdate"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
	"note_update"	TIMESTAMPTZ,
	"Field"	VARCHAR(255),
	"uid"	uuid	NOT NULL REFERENCES "user"(uid),
	"note_public"	BOOLEAN	DEFAULT FALSE
);
CREATE INDEX idx_note_uid ON note("uid");

-- 스타일 템플릿 테이블
CREATE TABLE "myStyles" (
	"style_id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"style_name"	varchar(100)	NOT NULL,
	"style_name_en"	varchar(100),
	"description"	text,
	"version"	VARCHAR(20)	DEFAULT '1.0',
	"display_order"	INTEGER	DEFAULT 0,
	"created_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 정의 템플릿 테이블
CREATE TABLE "myTemplates" (
	"tmpID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"tmpkind"	VARCHAR(255),
	"tmpdescription"	text,
	"tmpDisplay_order"	INTEGER	DEFAULT 0,
	"tmpCreated_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"tmpUpdated_at"	TIMESTAMP
);

-- 프로젝트 노트 연결 테이블
CREATE TABLE "proNote" (
	"nodeID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"prjID"	uuid	NOT NULL REFERENCES "projects"(prjID) ON DELETE CASCADE,
	"note_id"	uuid	NOT NULL REFERENCES "note"(note_id) ON DELETE CASCADE,
	"crtID"	uuid	NOT NULL REFERENCES "user"(uid),
	"pnote_status"	BOOLEAN	DEFAULT true,
	"pnote_endDate"	Date,
	"pnote_saveYear"	integer,
	"pnote_saveStatus"	BOOLEAN	DEFAULT true,
	"tmpID"	uuid	REFERENCES "myTemplates"(tmpID),
	"style_id"	uuid REFERENCES "myStyles"(style_id),
	"pnote_ispublic"	VARCHAR(255)
);
CREATE INDEX idx_proNote_prjID ON proNote("prjID");
CREATE INDEX idx_proNote_note_id ON proNote("note_id");

-- 프로젝트 내 노트 구조 (계층 구조)
CREATE TABLE "proNodes" (
	"nodeID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"prjID"	uuid	NOT NULL REFERENCES "projects"(prjID) ON DELETE CASCADE,
	"parentID"	uuid	NULL REFERENCES "proNodes"("nodeID") ON DELETE CASCADE,
	"type"	pronode_type DEFAULT 'folder' NOT NULL,
	"title"	VARCHAR(200)	NOT NULL,
	"created_at"	TIMESTAMPTZ	DEFAULT now(),
	"updated_at"	TIMESTAMPTZ	DEFAULT now()
);
CREATE INDEX idx_proNodes_prjID ON proNodes("prjID");
CREATE INDEX idx_proNodes_parentID ON proNodes("parentID");

-- 프로젝트 노트 기록 테이블
CREATE TABLE "pnote_history" (
	"pnhID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"nodeID"	uuid	NOT NULL REFERENCES "proNote"(nodeID) ON DELETE CASCADE,
	"pnhUserID"	uuid	NOT NULL REFERENCES "user"(uid),
	"pnhModify"	text,
	"pnhText"	text,
	"pnhModifySRange"	integer	DEFAULT 0,
	"pnhModifyERange"	integer	DEFAULT 0,
	"pnhModifyDate"	TIMESTAMPTZ,
	"pnhCreateDate"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pnote_history_nodeID ON pnote_history("nodeID");

-- 내 인용정보 라이브러리
CREATE TABLE "mycitations" (
	"mcID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
    "uid"   uuid    NOT NULL REFERENCES "user"(uid),
	"mcName"	text	NOT NULL,
	"mcAuthors"	text	NOT NULL,
	"mcPublicationyear"	integer	NOT NULL,
	"mcSource_type"	varchar(20)	NOT NULL,
	"mcPublisher"	varchar(200),
	"mcJorunalNm"	varchar(200),
	"mcVolume"	varchar(200),
	"mcIssue"	varchar(200),
	"mcPages"	varchar(200),
	"mcUrl"	text,
	"mcAccess_date"	date	DEFAULT CURRENT_DATE,
	"mcDoi"	varchar(200),
	"mcNotes"	text,
	"mcCreated_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"mcUpdated_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mycitations_uid ON mycitations("uid");

-- 노트와 인용정보 연결
CREATE TABLE "pnote_citations" (
	"npcID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"ctID"	uuid	NOT NULL REFERENCES "mycitations"(mcID) ON DELETE CASCADE,
	"nodeID"	uuid	NOT NULL REFERENCES "proNote"(nodeID) ON DELETE CASCADE,
	"npcStNum"	integer,
	"npcEdNum"	integer,
	"npcStatus"	BOOLEAN	DEFAULT true,
	"npcCtID"	uuid	REFERENCES "user"(uid),
	"npcCtDate"	date	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pnote_citations_ctID ON pnote_citations("ctID");
CREATE INDEX idx_pnote_citations_nodeID ON pnote_citations("nodeID");


-- 공동작업 댓글 테이블
CREATE TABLE "clbcomments" (
    "id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"nodeID"	uuid	NOT NULL REFERENCES "proNote"(nodeID) ON DELETE CASCADE,
	"ctID"	uuid	NOT NULL REFERENCES "user"(uid),
	"ctDate"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
	"ctState"	comment_state	DEFAULT 'begin',
	"ctUpdate"	TIMESTAMPTZ,
	"ctEndDate"	TIMESTAMPTZ,
	"cCompleteID"	uuid	NULL REFERENCES "user"(uid)
);
CREATE INDEX idx_clbcomments_nodeID ON clbcomments("nodeID");

-- 서식 카테고리
CREATE TABLE "format_categories" (
	"category_id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"style_id"	uuid	NOT NULL REFERENCES "myStyles"(style_id) ON DELETE CASCADE,
	"category_name"	varchar(50)	NOT NULL,
	"category_name_en"	varchar(50),
	"icon"	text,
	"display_order"	INTEGER	DEFAULT 0,
	"description"	text,
	"is_active"	BOOLEAN	DEFAULT TRUE,
	"created_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_format_categories_style_id ON format_categories("style_id");

-- 서식 규칙
CREATE TABLE "format_rules" (
	"rule_id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"category_id"	uuid	NOT NULL REFERENCES "format_categories"(category_id) ON DELETE CASCADE,
	"style_id"	uuid	NOT NULL REFERENCES "myStyles"(style_id) ON DELETE CASCADE,
	"element_name"	VARCHAR(100)	NOT NULL,
	"element_name_en"	VARCHAR(100),
	"element_code"	VARCHAR(50),
	"setting_value"	TEXT	NOT NULL,
	"example_note"	TEXT,
	"css_selector"	VARCHAR(200),
	"is_active"	BOOLEAN	DEFAULT TRUE,
	"display_order"	INTEGER	DEFAULT 0,
	"created_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_format_rules_category_id ON format_rules("category_id");

-- 내 자료 라이브러리
CREATE TABLE "mylib" (
	"mlID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
    "uid"   uuid    NOT NULL REFERENCES "user"(uid),
	"mlTitle"	TEXT	NOT NULL,
	"type"	TEXT	NOT NULL,
	"url"	TEXT,
	"author"	TEXT,
	"publisher"	varchar(200),
	"published_date"	DATE,
	"accessed_date"	DATE	DEFAULT CURRENT_DATE,
	"created_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TIMESTAMP
);
CREATE INDEX idx_mylib_uid ON mylib("uid");

-- 내 자료 라이브러리 아이템
CREATE TABLE "mylibitems" (
	"item_id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"mlID"	uuid	NOT NULL REFERENCES "mylib"(mlID) ON DELETE CASCADE,
	"item_type"	mylibitem_type DEFAULT 'file' NOT NULL,
	"title"	text	NOT NULL,
	"url"	text,
	"content"	JSONB,
	"created_at"	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TIMESTAMP
);
CREATE INDEX idx_mylibitems_mlID ON mylibitems("mlID");

-- 나의 할 일 목록
CREATE TABLE "myTodolist" (
	"id"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"uid"	uuid	NOT NULL REFERENCES "user"(uid) ON DELETE CASCADE,
	"prjID"	uuid	REFERENCES "projects"(prjID) ON DELETE SET NULL,
	"todoDspOrder"	integer	DEFAULT 0 NOT NULL,
	"todoPriority"	varchar(20)	NOT NULL,
	"todoDsc"	text,
	"todoCreateDT"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
	"todoSttDT"	TIMESTAMPTZ,
	"todoUpdateDT"	TIMESTAMPTZ,
	"todoEndDT"	TIMESTAMPTZ,
	"todoStatue"	boolean	DEFAULT true
);
CREATE INDEX idx_myTodolist_uid ON myTodolist("uid");

-- 일반 설정
CREATE TABLE "genSettings" (
	"gstkind"	varchar(20)	DEFAULT 'user'	NOT NULL,
	"gstkeyid"	varchar(20)	DEFAULT '0000'	NOT NULL,
	"uid"	uuid	NOT NULL REFERENCES "user"(uid) ON DELETE CASCADE,
	"gstname"	VARCHAR(200),
	"gstvalue"	TEXT	NOT NULL,
	"gsttype"	VARCHAR(50),
	"gstcategory"	VARCHAR(50),
	"gstdescription"	TEXT,
	"gstisactive"	BOOLEAN	DEFAULT true,
	"gstcreated_at"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP,
	"gstupdated_at"	TIMESTAMPTZ,
    PRIMARY KEY ("gstkind", "gstkeyid", "uid")
);

-- 노트와 자료 라이브러리 연결
CREATE TABLE "noteLib" (
	"ntlID"	uuid	PRIMARY KEY DEFAULT uuid_generate_v4(),
	"nodeID"	uuid	NOT NULL REFERENCES "proNote"(nodeID) ON DELETE CASCADE,
	"mlID"	uuid	NOT NULL REFERENCES "mylib"(mlID) ON DELETE CASCADE,
	"ntlKind"	varchar(20),
	"ntlSAply"	integer	DEFAULT 0,
	"ntlEAply"	integer	DEFAULT 0,
	"ntlDescrption"	text,
	"ntlUserID"	uuid	NOT NULL REFERENCES "user"(uid),
	"ntlDate"	TIMESTAMPTZ	DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_noteLib_nodeID ON noteLib("nodeID");
CREATE INDEX idx_noteLib_mlID ON noteLib("mlID");

-- admin 계정 추가(페스워드: admin123)
INSERT INTO users (uemail, upassword, urole, uname) 
VALUES ('admin@admin.com', '$2b$12$Cv7n8XchaVKd9AtoQyv33OXB9Ur16GVRrfTDVbOnMHAlXydYvuTGO', 'admin', 'admin');


-- 롤백
DROP TABLE IF EXISTS "noteLib" CASCADE;
DROP TABLE IF EXISTS "genSettings" CASCADE;
DROP TABLE IF EXISTS "myTodolist" CASCADE;
DROP TABLE IF EXISTS "mylibitems" CASCADE;
DROP TABLE IF EXISTS "mylib" CASCADE;
DROP TABLE IF EXISTS "format_rules" CASCADE;
DROP TABLE IF EXISTS "format_categories" CASCADE;
DROP TABLE IF EXISTS "clbcomments" CASCADE;
DROP TABLE IF EXISTS "pnote_citations" CASCADE;
DROP TABLE IF EXISTS "mycitations" CASCADE;
DROP TABLE IF EXISTS "pnote_history" CASCADE;
DROP TABLE IF EXISTS "proNodes" CASCADE;
DROP TABLE IF EXISTS "proNote" CASCADE;
DROP TABLE IF EXISTS "myTemplates" CASCADE;
DROP TABLE IF EXISTS "myStyles" CASCADE;
DROP TABLE IF EXISTS "note" CASCADE;
DROP TABLE IF EXISTS "prjuser" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS project_visibility;
DROP TYPE IF EXISTS prjuser_role;
DROP TYPE IF EXISTS pronode_type;
DROP TYPE IF EXISTS mylibitem_type;
DROP TYPE IF EXISTS comment_state;

DROP EXTENSION IF EXISTS "uuid-ossp";