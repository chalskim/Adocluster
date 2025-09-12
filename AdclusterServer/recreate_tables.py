#!/usr/bin/env python3
"""
Script to recreate database tables based on the SQL backup file
"""

import psycopg2
import sys
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'adcluster_db'),
            user=os.getenv('DB_USER', 'adcluster'),
            password=os.getenv('DB_PASSWORD', 'a770405z')
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def recreate_tables():
    """Recreate all tables based on the backup file structure"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Enable extensions
        print("Enabling extensions...")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS ltree;")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
        
        # Drop existing tables if they exist (in correct order to avoid foreign key issues)
        print("Dropping existing tables...")
        tables = [
            'clbcomments', 'format_categories', 'format_rules', 'gensettings',
            'mycitations', 'mylibitems', 'mylib', 'mystyles', 'mytempletes',
            'mytodolist', 'notelib', 'pnote_citations', 'pnote_history',
            'prjuser', 'projects', 'pronodes', 'pronote', 'users'
        ]
        
        for table in tables:
            try:
                cursor.execute(sql.SQL("DROP TABLE IF EXISTS {} CASCADE").format(sql.Identifier(table)))
                print(f"Dropped table {table}")
            except Exception as e:
                print(f"Warning: Could not drop table {table}: {e}")
        
        # Recreate tables in the correct order (parents first)
        print("Creating tables...")
        
        # Users table
        cursor.execute("""
            CREATE TABLE users (
                uid uuid DEFAULT uuid_generate_v4() NOT NULL,
                uemail character varying(150) NOT NULL,
                upassword character varying(100),
                urole character varying(50) DEFAULT 'user',
                uavatar text,
                ucreate_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                ulast_login timestamp with time zone,
                uupdated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                uname character varying(100) DEFAULT 'anonymous' NOT NULL,
                uisdel boolean DEFAULT false,
                uactive boolean DEFAULT true
            );
        """)
        print("Created table users")
        
        # Projects table
        cursor.execute("""
            CREATE TABLE projects (
                prjid uuid DEFAULT uuid_generate_v4() NOT NULL,
                crtid uuid NOT NULL,
                title character varying(200) NOT NULL,
                description text,
                protag text,
                prokey text,
                visibility character varying(50) DEFAULT 'team' NOT NULL,
                status character varying(50),
                start_date date,
                end_date date,
                created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                update_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table projects")
        
        # Pronodes table
        cursor.execute("""
            CREATE TABLE pronodes (
                nodeid uuid DEFAULT uuid_generate_v4() NOT NULL,
                prjid uuid NOT NULL,
                prjid_parents uuid,
                type character varying(50) DEFAULT 'folder' NOT NULL,
                title character varying(200) NOT NULL,
                created_at timestamp with time zone DEFAULT now(),
                updated_at timestamp with time zone DEFAULT now()
            );
        """)
        print("Created table pronodes")
        
        # Mytempletes table
        cursor.execute("""
            CREATE TABLE mytempletes (
                tmpid uuid DEFAULT uuid_generate_v4() NOT NULL,
                tmpkind character varying(255),
                tmpdescription text,
                tmpdisplay_order integer DEFAULT 0,
                tmpcreated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                tmpupdated_at timestamp without time zone
            );
        """)
        print("Created table mytempletes")
        
        # Mystyles table
        cursor.execute("""
            CREATE TABLE mystyles (
                style_id uuid DEFAULT uuid_generate_v4() NOT NULL,
                style_name character varying(100) NOT NULL,
                style_name_en character varying(100),
                description text,
                version character varying(20) DEFAULT '1.0',
                display_order integer DEFAULT 0,
                created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table mystyles")
        
        # Pronote table
        cursor.execute("""
            CREATE TABLE pronote (
                noteid uuid DEFAULT uuid_generate_v4() NOT NULL,
                nodeid uuid NOT NULL,
                prjid uuid NOT NULL,
                note_descrtion text,
                crtid uuid NOT NULL,
                status boolean DEFAULT true,
                create_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                update_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                enddate date,
                saveyear integer,
                savestatus boolean DEFAULT true,
                tmpid uuid NOT NULL,
                style_id uuid NOT NULL
            );
        """)
        print("Created table pronote")
        
        # Mylib table
        cursor.execute("""
            CREATE TABLE mylib (
                mlid uuid DEFAULT uuid_generate_v4() NOT NULL,
                mltitle text NOT NULL,
                type text NOT NULL,
                url text,
                author character varying(200),
                publisher character varying(200),
                published_date date,
                accessed_date date DEFAULT CURRENT_DATE,
                created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp without time zone
            );
        """)
        print("Created table mylib")
        
        # Mycitations table
        cursor.execute("""
            CREATE TABLE mycitations (
                mcid uuid DEFAULT uuid_generate_v4() NOT NULL,
                mcname text NOT NULL,
                mcauthors text NOT NULL,
                mcpublicationyear integer NOT NULL,
                mcsource_type character varying(20) NOT NULL,
                mcpublisher character varying(200),
                mcjorunalnm character varying(200),
                mcvolume character varying(200),
                mcissue character varying(200),
                mcpages character varying(200),
                mcurl text,
                mcaccess_date date,
                mcdoi character varying(200),
                mcnotes text,
                mccreated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                mcupdated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table mycitations")
        
        # Mylibitems table
        cursor.execute("""
            CREATE TABLE mylibitems (
                item_id uuid DEFAULT uuid_generate_v4() NOT NULL,
                mlid uuid NOT NULL,
                item_type character varying(20) DEFAULT 'file',
                title text NOT NULL,
                url text,
                content jsonb,
                created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp without time zone
            );
        """)
        print("Created table mylibitems")
        
        # Gensettings table
        cursor.execute("""
            CREATE TABLE gensettings (
                gstkeyid uuid DEFAULT uuid_generate_v4() NOT NULL,
                gstkind character varying(20) DEFAULT 'user' NOT NULL,
                uid uuid NOT NULL,
                gstname character varying(200),
                gstvalue text NOT NULL,
                gsttype character varying(50),
                gstcategory character varying(50),
                gstdescription text,
                gstisactive boolean DEFAULT true,
                gstcreated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                gstupdated_at timestamp with time zone
            );
        """)
        print("Created table gensettings")
        
        # Format_categories table
        cursor.execute("""
            CREATE TABLE format_categories (
                category_id uuid DEFAULT uuid_generate_v4() NOT NULL,
                style_id uuid NOT NULL,
                category_name character varying(50) NOT NULL,
                category_name_en character varying(50),
                icon text,
                display_order integer DEFAULT 0,
                description text,
                is_active boolean DEFAULT true,
                created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table format_categories")
        
        # Format_rules table
        cursor.execute("""
            CREATE TABLE format_rules (
                rule_id uuid DEFAULT uuid_generate_v4() NOT NULL,
                category_id uuid NOT NULL,
                style_id uuid NOT NULL,
                element_name character varying(100) NOT NULL,
                element_name_en character varying(100),
                element_code character varying(50),
                setting_value text NOT NULL,
                example_note text,
                css_selector character varying(200),
                is_active boolean DEFAULT true,
                display_order integer DEFAULT 0,
                created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table format_rules")
        
        # Prjuser table
        cursor.execute("""
            CREATE TABLE prjuser (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                prjid uuid NOT NULL,
                uid uuid NOT NULL,
                role character varying(50) DEFAULT 'reader',
                created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                update_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table prjuser")
        
        # Notelib table
        cursor.execute("""
            CREATE TABLE notelib (
                ntlid uuid DEFAULT uuid_generate_v4() NOT NULL,
                noteid uuid NOT NULL,
                nodeid uuid NOT NULL,
                prjid uuid NOT NULL,
                mlid uuid NOT NULL,
                ntlkind character varying(20),
                ntlsaply integer DEFAULT 0,
                ntleaply integer DEFAULT 0,
                ntldescrption text,
                ntluserid uuid NOT NULL,
                ntldate timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table notelib")
        
        # Pnote_history table
        cursor.execute("""
            CREATE TABLE pnote_history (
                phid uuid DEFAULT uuid_generate_v4() NOT NULL,
                noteid uuid NOT NULL,
                nodeid uuid NOT NULL,
                prjid uuid NOT NULL,
                phuserid uuid NOT NULL,
                phmodify text,
                phtext text,
                phmodifysrange integer DEFAULT 0,
                phmodifyerange integer DEFAULT 0,
                phmodifydate timestamp with time zone,
                phcreatedate timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Created table pnote_history")
        
        # Pnote_citations table
        cursor.execute("""
            CREATE TABLE pnote_citations (
                npcid uuid DEFAULT uuid_generate_v4() NOT NULL,
                citation_id uuid NOT NULL,
                noteid uuid NOT NULL,
                nodeid uuid NOT NULL,
                prjid uuid NOT NULL,
                npcstnum integer,
                npcednum integer,
                npcstatus boolean DEFAULT true,
                npcctid uuid,
                npcctdate date DEFAULT CURRENT_DATE
            );
        """)
        print("Created table pnote_citations")
        
        # Clbcomments table
        cursor.execute("""
            CREATE TABLE clbcomments (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                noteid uuid NOT NULL,
                nodeid uuid NOT NULL,
                prjid uuid NOT NULL,
                comment_creator_uid uuid NOT NULL,
                ctdate timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                ctstate character varying(20) DEFAULT 'begin',
                ctupdate timestamp with time zone,
                ctenddate timestamp with time zone,
                ccompleteid uuid
            );
        """)
        print("Created table clbcomments")
        
        # Mytodolist table
        cursor.execute("""
            CREATE TABLE mytodolist (
                id uuid DEFAULT uuid_generate_v4() NOT NULL,
                uid uuid NOT NULL,
                prjid uuid NOT NULL,
                tododsporder integer DEFAULT 0 NOT NULL,
                todopriority character varying(20) NOT NULL,
                tododsc text,
                todocreatedt timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                todosttdt timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                todoupdatedt timestamp with time zone,
                todoenddt timestamp with time zone,
                todostatue boolean DEFAULT true
            );
        """)
        print("Created table mytodolist")
        
        # Add primary keys
        print("Adding primary keys...")
        cursor.execute("ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (uid);")
        cursor.execute("ALTER TABLE projects ADD CONSTRAINT projects_pkey PRIMARY KEY (prjid);")
        cursor.execute("ALTER TABLE pronodes ADD CONSTRAINT pronodes_pkey PRIMARY KEY (nodeid);")
        cursor.execute("ALTER TABLE mytempletes ADD CONSTRAINT mytempletes_pkey PRIMARY KEY (tmpid);")
        cursor.execute("ALTER TABLE mystyles ADD CONSTRAINT mystyles_pkey PRIMARY KEY (style_id);")
        cursor.execute("ALTER TABLE pronote ADD CONSTRAINT pronote_pkey PRIMARY KEY (noteid);")
        cursor.execute("ALTER TABLE mylib ADD CONSTRAINT mylib_pkey PRIMARY KEY (mlid);")
        cursor.execute("ALTER TABLE mycitations ADD CONSTRAINT mycitations_pkey PRIMARY KEY (mcid);")
        cursor.execute("ALTER TABLE mylibitems ADD CONSTRAINT mylibitems_pkey PRIMARY KEY (item_id);")
        cursor.execute("ALTER TABLE gensettings ADD CONSTRAINT gensettings_pkey PRIMARY KEY (gstkeyid);")
        cursor.execute("ALTER TABLE format_categories ADD CONSTRAINT format_categories_pkey PRIMARY KEY (category_id);")
        cursor.execute("ALTER TABLE format_rules ADD CONSTRAINT format_rules_pkey PRIMARY KEY (rule_id);")
        cursor.execute("ALTER TABLE prjuser ADD CONSTRAINT prjuser_pkey PRIMARY KEY (id);")
        cursor.execute("ALTER TABLE notelib ADD CONSTRAINT notelib_pkey PRIMARY KEY (ntlid);")
        cursor.execute("ALTER TABLE pnote_history ADD CONSTRAINT pnote_history_pkey PRIMARY KEY (phid);")
        cursor.execute("ALTER TABLE pnote_citations ADD CONSTRAINT pnote_citations_pkey PRIMARY KEY (npcid);")
        cursor.execute("ALTER TABLE clbcomments ADD CONSTRAINT clbcomments_pkey PRIMARY KEY (id);")
        cursor.execute("ALTER TABLE mytodolist ADD CONSTRAINT mytodolist_pkey PRIMARY KEY (id);")
        
        # Add unique constraints
        print("Adding unique constraints...")
        cursor.execute("ALTER TABLE users ADD CONSTRAINT users_uemail_key UNIQUE (uemail);")
        
        # Add foreign key constraints
        print("Adding foreign key constraints...")
        cursor.execute("ALTER TABLE projects ADD CONSTRAINT projects_crtid_fkey FOREIGN KEY (crtid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE pronodes ADD CONSTRAINT pronodes_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE pronodes ADD CONSTRAINT pronodes_prjid_parents_fkey FOREIGN KEY (prjid_parents) REFERENCES pronodes(nodeid);")
        cursor.execute("ALTER TABLE pronote ADD CONSTRAINT pronote_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE pronote ADD CONSTRAINT pronote_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES pronodes(nodeid);")
        cursor.execute("ALTER TABLE pronote ADD CONSTRAINT pronote_crtid_fkey FOREIGN KEY (crtid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE pronote ADD CONSTRAINT pronote_tmpid_fkey FOREIGN KEY (tmpid) REFERENCES mytempletes(tmpid);")
        cursor.execute("ALTER TABLE pronote ADD CONSTRAINT pronote_style_id_fkey FOREIGN KEY (style_id) REFERENCES mystyles(style_id);")
        cursor.execute("ALTER TABLE mylibitems ADD CONSTRAINT mylibitems_mlid_fkey FOREIGN KEY (mlid) REFERENCES mylib(mlid);")
        cursor.execute("ALTER TABLE format_categories ADD CONSTRAINT format_categories_style_id_fkey FOREIGN KEY (style_id) REFERENCES mystyles(style_id);")
        cursor.execute("ALTER TABLE format_rules ADD CONSTRAINT format_rules_category_id_fkey FOREIGN KEY (category_id) REFERENCES format_categories(category_id);")
        cursor.execute("ALTER TABLE format_rules ADD CONSTRAINT format_rules_style_id_fkey FOREIGN KEY (style_id) REFERENCES mystyles(style_id);")
        cursor.execute("ALTER TABLE prjuser ADD CONSTRAINT prjuser_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE prjuser ADD CONSTRAINT prjuser_uid_fkey FOREIGN KEY (uid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE notelib ADD CONSTRAINT notelib_noteid_fkey FOREIGN KEY (noteid) REFERENCES pronote(noteid);")
        cursor.execute("ALTER TABLE notelib ADD CONSTRAINT notelib_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES pronodes(nodeid);")
        cursor.execute("ALTER TABLE notelib ADD CONSTRAINT notelib_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE notelib ADD CONSTRAINT notelib_mlid_fkey FOREIGN KEY (mlid) REFERENCES mylib(mlid);")
        cursor.execute("ALTER TABLE notelib ADD CONSTRAINT notelib_ntluserid_fkey FOREIGN KEY (ntluserid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE pnote_history ADD CONSTRAINT pnote_history_noteid_fkey FOREIGN KEY (noteid) REFERENCES pronote(noteid);")
        cursor.execute("ALTER TABLE pnote_history ADD CONSTRAINT pnote_history_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES pronodes(nodeid);")
        cursor.execute("ALTER TABLE pnote_history ADD CONSTRAINT pnote_history_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE pnote_history ADD CONSTRAINT pnote_history_phuserid_fkey FOREIGN KEY (phuserid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE pnote_citations ADD CONSTRAINT pnote_citations_citation_id_fkey FOREIGN KEY (citation_id) REFERENCES mycitations(mcid);")
        cursor.execute("ALTER TABLE pnote_citations ADD CONSTRAINT pnote_citations_noteid_fkey FOREIGN KEY (noteid) REFERENCES pronote(noteid);")
        cursor.execute("ALTER TABLE pnote_citations ADD CONSTRAINT pnote_citations_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES pronodes(nodeid);")
        cursor.execute("ALTER TABLE pnote_citations ADD CONSTRAINT pnote_citations_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE clbcomments ADD CONSTRAINT clbcomments_noteid_fkey FOREIGN KEY (noteid) REFERENCES pronote(noteid);")
        cursor.execute("ALTER TABLE clbcomments ADD CONSTRAINT clbcomments_nodeid_fkey FOREIGN KEY (nodeid) REFERENCES pronodes(nodeid);")
        cursor.execute("ALTER TABLE clbcomments ADD CONSTRAINT clbcomments_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        cursor.execute("ALTER TABLE clbcomments ADD CONSTRAINT clbcomments_comment_creator_uid_fkey FOREIGN KEY (comment_creator_uid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE clbcomments ADD CONSTRAINT clbcomments_ccompleteid_fkey FOREIGN KEY (ccompleteid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE gensettings ADD CONSTRAINT gensettings_uid_fkey FOREIGN KEY (uid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE mytodolist ADD CONSTRAINT mytodolist_uid_fkey FOREIGN KEY (uid) REFERENCES users(uid);")
        cursor.execute("ALTER TABLE mytodolist ADD CONSTRAINT mytodolist_prjid_fkey FOREIGN KEY (prjid) REFERENCES projects(prjid);")
        
        # Create indexes
        print("Creating indexes...")
        indexes = [
            # Users indexes
            "CREATE INDEX idx_users_uemail ON users USING btree (uemail);",
            "CREATE INDEX idx_users_uisdel ON users USING btree (uisdel);",
            
            # Projects indexes
            "CREATE INDEX idx_projects_crtid ON projects USING btree (crtid);",
            "CREATE INDEX idx_projects_title ON projects USING btree (title);",
            
            # Pronodes indexes
            "CREATE INDEX idx_pronodes_prjid ON pronodes USING btree (prjid);",
            "CREATE INDEX idx_pronodes_prjid_parents ON pronodes USING btree (prjid_parents);",
            "CREATE INDEX idx_pronodes_type_title ON pronodes USING btree (type, title);",
            
            # Pronote indexes
            "CREATE INDEX idx_pronote_prjid ON pronote USING btree (prjid);",
            "CREATE INDEX idx_pronote_nodeid ON pronote USING btree (nodeid);",
            "CREATE INDEX idx_pronote_crtid ON pronote USING btree (crtid);",
            "CREATE INDEX idx_pronote_tmpid ON pronote USING btree (tmpid);",
            "CREATE INDEX idx_pronote_style_id ON pronote USING btree (style_id);",
            "CREATE INDEX idx_pronote_saveyear_status ON pronote USING btree (saveyear, savestatus);",
            
            # Mylib indexes
            "CREATE INDEX idx_mylib_mltitle ON mylib USING btree (mltitle);",
            "CREATE INDEX idx_mylib_type ON mylib USING btree (type);",
            "CREATE INDEX idx_mylib_author ON mylib USING btree (author);",
            
            # Mycitations indexes
            "CREATE INDEX idx_mycitations_mcname ON mycitations USING btree (mcname);",
            "CREATE INDEX idx_mycitations_authors_year ON mycitations USING btree (mcauthors, mcpublicationyear);",
            "CREATE INDEX idx_mycitations_sourcetype ON mycitations USING btree (mcsource_type);",
            
            # Mylibitems indexes
            "CREATE INDEX idx_mylibitems_mlid ON mylibitems USING btree (mlid);",
            "CREATE INDEX idx_mylibitems_type_title ON mylibitems USING btree (item_type, title);",
            
            # Gensettings indexes
            "CREATE INDEX idx_gensettings_uid ON gensettings USING btree (uid);",
            "CREATE INDEX idx_gensettings_gstname ON gensettings USING btree (gstname);",
            "CREATE INDEX idx_gensettings_kind_type_category ON gensettings USING btree (gstkind, gsttype, gstcategory);",
            
            # Format_categories indexes
            "CREATE INDEX idx_format_categories_style_id ON format_categories USING btree (style_id);",
            "CREATE INDEX idx_format_categories_name_active ON format_categories USING btree (category_name, is_active);",
            
            # Format_rules indexes
            "CREATE INDEX idx_format_rules_category_id ON format_rules USING btree (category_id);",
            "CREATE INDEX idx_format_rules_style_id ON format_rules USING btree (style_id);",
            "CREATE INDEX idx_format_rules_element_name_active ON format_rules USING btree (element_name, is_active);",
            
            # Prjuser indexes
            "CREATE INDEX idx_prjuser_prjid ON prjuser USING btree (prjid);",
            "CREATE INDEX idx_prjuser_uid ON prjuser USING btree (uid);",
            "CREATE INDEX idx_prjuser_role ON prjuser USING btree (role);",
            
            # Notelib indexes
            "CREATE INDEX idx_notelib_noteid ON notelib USING btree (noteid);",
            "CREATE INDEX idx_notelib_nodeid ON notelib USING btree (nodeid);",
            "CREATE INDEX idx_notelib_prjid ON notelib USING btree (prjid);",
            "CREATE INDEX idx_notelib_mlid ON notelib USING btree (mlid);",
            "CREATE INDEX idx_notelib_ntluserid ON notelib USING btree (ntluserid);",
            "CREATE INDEX idx_notelib_ntlkind ON notelib USING btree (ntlkind);",
            
            # Pnote_history indexes
            "CREATE INDEX idx_pnote_history_noteid ON pnote_history USING btree (noteid);",
            "CREATE INDEX idx_pnote_history_nodeid ON pnote_history USING btree (nodeid);",
            "CREATE INDEX idx_pnote_history_prjid ON pnote_history USING btree (prjid);",
            "CREATE INDEX idx_pnote_history_phuserid ON pnote_history USING btree (phuserid);",
            "CREATE INDEX idx_pnote_history_phcreatedate ON pnote_history USING btree (phcreatedate);",
            
            # Pnote_citations indexes
            "CREATE INDEX idx_pnote_citations_noteid ON pnote_citations USING btree (noteid);",
            "CREATE INDEX idx_pnote_citations_nodeid ON pnote_citations USING btree (nodeid);",
            "CREATE INDEX idx_pnote_citations_prjid ON pnote_citations USING btree (prjid);",
            "CREATE INDEX idx_pnote_citations_citation_id ON pnote_citations USING btree (citation_id);",
            "CREATE INDEX idx_pnote_citations_status ON pnote_citations USING btree (npcstatus);",
            
            # Clbcomments indexes
            "CREATE INDEX idx_clbcomments_noteid ON clbcomments USING btree (noteid);",
            "CREATE INDEX idx_clbcomments_nodeid ON clbcomments USING btree (nodeid);",
            "CREATE INDEX idx_clbcomments_prjid ON clbcomments USING btree (prjid);",
            "CREATE INDEX idx_clbcomments_comment_creator_uid ON clbcomments USING btree (comment_creator_uid);",
            "CREATE INDEX idx_clbcomments_ctstate ON clbcomments USING btree (ctstate);",
            
            # Mytodolist indexes
            "CREATE INDEX idx_mytodolist_uid ON mytodolist USING btree (uid);",
            "CREATE INDEX idx_mytodolist_prjid ON mytodolist USING btree (prjid);",
            "CREATE INDEX idx_mytodolist_status_priority ON mytodolist USING btree (todostatue, todopriority);",
            "CREATE INDEX idx_mytodolist_enddt ON mytodolist USING btree (todoenddt);",
            
            # Mytempletes indexes
            "CREATE INDEX idx_mytempletes_tmpkind ON mytempletes USING btree (tmpkind);",
            
            # Mystyles indexes
            "CREATE INDEX idx_mystyles_style_name ON mystyles USING btree (style_name);"
        ]
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
                print(f"Created index: {index_sql[:50]}...")
            except Exception as e:
                print(f"Warning: Could not create index: {e}")
        
        # Commit changes
        conn.commit()
        print("All tables recreated successfully!")
        
    except Exception as e:
        print(f"Error recreating tables: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    recreate_tables()