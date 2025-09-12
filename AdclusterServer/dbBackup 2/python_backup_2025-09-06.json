{
  "schema": {
    "format_categories": {
      "columns": [
        {
          "name": "category_id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "style_id",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "category_name",
          "type": "VARCHAR(50)",
          "nullable": false,
          "default": null
        },
        {
          "name": "category_name_en",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": null
        },
        {
          "name": "icon",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "display_order",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "description",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "is_active",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "category_id"
        ],
        "name": "format_categories_pkey"
      },
      "foreign_keys": [
        {
          "name": "format_categories_style_id_fkey",
          "constrained_columns": [
            "style_id"
          ],
          "referred_schema": null,
          "referred_table": "mystyles",
          "referred_columns": [
            "style_id"
          ],
          "options": {}
        }
      ]
    },
    "format_rules": {
      "columns": [
        {
          "name": "rule_id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "category_id",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "style_id",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "element_name",
          "type": "VARCHAR(100)",
          "nullable": false,
          "default": null
        },
        {
          "name": "element_name_en",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": null
        },
        {
          "name": "element_code",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": null
        },
        {
          "name": "setting_value",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "example_note",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "css_selector",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "is_active",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        },
        {
          "name": "display_order",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "rule_id"
        ],
        "name": "format_rules_pkey"
      },
      "foreign_keys": [
        {
          "name": "format_rules_category_id_fkey",
          "constrained_columns": [
            "category_id"
          ],
          "referred_schema": null,
          "referred_table": "format_categories",
          "referred_columns": [
            "category_id"
          ],
          "options": {}
        },
        {
          "name": "format_rules_style_id_fkey",
          "constrained_columns": [
            "style_id"
          ],
          "referred_schema": null,
          "referred_table": "mystyles",
          "referred_columns": [
            "style_id"
          ],
          "options": {}
        }
      ]
    },
    "prjuser": {
      "columns": [
        {
          "name": "id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "uid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "role",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": "'reader'::character varying"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "update_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "id"
        ],
        "name": "prjuser_pkey"
      },
      "foreign_keys": [
        {
          "name": "prjuser_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        },
        {
          "name": "prjuser_uid_fkey",
          "constrained_columns": [
            "uid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        }
      ]
    },
    "clbcomments": {
      "columns": [
        {
          "name": "id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "noteid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "nodeid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "comment_creator_uid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "ctdate",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "ctstate",
          "type": "VARCHAR(20)",
          "nullable": true,
          "default": "'begin'::character varying"
        },
        {
          "name": "ctupdate",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        },
        {
          "name": "ctenddate",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        },
        {
          "name": "ccompleteid",
          "type": "UUID",
          "nullable": true,
          "default": null
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "id"
        ],
        "name": "clbcomments_pkey"
      },
      "foreign_keys": [
        {
          "name": "clbcomments_ccompleteid_fkey",
          "constrained_columns": [
            "ccompleteid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        },
        {
          "name": "clbcomments_comment_creator_uid_fkey",
          "constrained_columns": [
            "comment_creator_uid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        },
        {
          "name": "clbcomments_nodeid_fkey",
          "constrained_columns": [
            "nodeid"
          ],
          "referred_schema": null,
          "referred_table": "pronodes",
          "referred_columns": [
            "nodeid"
          ],
          "options": {}
        },
        {
          "name": "clbcomments_noteid_fkey",
          "constrained_columns": [
            "noteid"
          ],
          "referred_schema": null,
          "referred_table": "pronote",
          "referred_columns": [
            "noteid"
          ],
          "options": {}
        },
        {
          "name": "clbcomments_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        }
      ]
    },
    "pnote_history": {
      "columns": [
        {
          "name": "phid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "noteid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "nodeid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "phuserid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "phmodify",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "phtext",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "phmodifysrange",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "phmodifyerange",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "phmodifydate",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        },
        {
          "name": "phcreatedate",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "phid"
        ],
        "name": "pnote_history_pkey"
      },
      "foreign_keys": [
        {
          "name": "pnote_history_nodeid_fkey",
          "constrained_columns": [
            "nodeid"
          ],
          "referred_schema": null,
          "referred_table": "pronodes",
          "referred_columns": [
            "nodeid"
          ],
          "options": {}
        },
        {
          "name": "pnote_history_noteid_fkey",
          "constrained_columns": [
            "noteid"
          ],
          "referred_schema": null,
          "referred_table": "pronote",
          "referred_columns": [
            "noteid"
          ],
          "options": {}
        },
        {
          "name": "pnote_history_phuserid_fkey",
          "constrained_columns": [
            "phuserid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        },
        {
          "name": "pnote_history_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        }
      ]
    },
    "users": {
      "columns": [
        {
          "name": "uid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "uemail",
          "type": "VARCHAR(150)",
          "nullable": false,
          "default": null
        },
        {
          "name": "upassword",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": null
        },
        {
          "name": "urole",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": "'user'::character varying"
        },
        {
          "name": "uavatar",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "ucreate_at",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "ulast_login",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        },
        {
          "name": "uupdated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "uid"
        ],
        "name": "users_pkey"
      },
      "foreign_keys": []
    },
    "projects": {
      "columns": [
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "crtid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "title",
          "type": "VARCHAR(200)",
          "nullable": false,
          "default": null
        },
        {
          "name": "description",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "protag",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "prokey",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "visibility",
          "type": "VARCHAR(50)",
          "nullable": false,
          "default": "'team'::character varying"
        },
        {
          "name": "status",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": null
        },
        {
          "name": "start_date",
          "type": "DATE",
          "nullable": true,
          "default": null
        },
        {
          "name": "end_date",
          "type": "DATE",
          "nullable": true,
          "default": null
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "update_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "prjid"
        ],
        "name": "projects_pkey"
      },
      "foreign_keys": [
        {
          "name": "projects_crtid_fkey",
          "constrained_columns": [
            "crtid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        }
      ]
    },
    "pronodes": {
      "columns": [
        {
          "name": "nodeid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid_parents",
          "type": "UUID",
          "nullable": true,
          "default": null
        },
        {
          "name": "type",
          "type": "VARCHAR(50)",
          "nullable": false,
          "default": "'folder'::character varying"
        },
        {
          "name": "title",
          "type": "VARCHAR(200)",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "now()"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "nodeid"
        ],
        "name": "pronodes_pkey"
      },
      "foreign_keys": [
        {
          "name": "pronodes_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        },
        {
          "name": "pronodes_prjid_parents_fkey",
          "constrained_columns": [
            "prjid_parents"
          ],
          "referred_schema": null,
          "referred_table": "pronodes",
          "referred_columns": [
            "nodeid"
          ],
          "options": {}
        }
      ]
    },
    "pronote": {
      "columns": [
        {
          "name": "noteid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "nodeid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "note_descrtion",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "crtid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "status",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        },
        {
          "name": "create_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "update_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "enddate",
          "type": "DATE",
          "nullable": true,
          "default": null
        },
        {
          "name": "saveyear",
          "type": "INTEGER",
          "nullable": true,
          "default": null
        },
        {
          "name": "savestatus",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        },
        {
          "name": "tmpid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "style_id",
          "type": "UUID",
          "nullable": false,
          "default": null
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "noteid"
        ],
        "name": "pronote_pkey"
      },
      "foreign_keys": [
        {
          "name": "pronote_crtid_fkey",
          "constrained_columns": [
            "crtid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        },
        {
          "name": "pronote_nodeid_fkey",
          "constrained_columns": [
            "nodeid"
          ],
          "referred_schema": null,
          "referred_table": "pronodes",
          "referred_columns": [
            "nodeid"
          ],
          "options": {}
        },
        {
          "name": "pronote_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        },
        {
          "name": "pronote_style_id_fkey",
          "constrained_columns": [
            "style_id"
          ],
          "referred_schema": null,
          "referred_table": "mystyles",
          "referred_columns": [
            "style_id"
          ],
          "options": {}
        },
        {
          "name": "pronote_tmpid_fkey",
          "constrained_columns": [
            "tmpid"
          ],
          "referred_schema": null,
          "referred_table": "mytempletes",
          "referred_columns": [
            "tmpid"
          ],
          "options": {}
        }
      ]
    },
    "mytempletes": {
      "columns": [
        {
          "name": "tmpid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "tmpkind",
          "type": "VARCHAR(255)",
          "nullable": true,
          "default": null
        },
        {
          "name": "tmpdescription",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "tmpdisplay_order",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "tmpcreated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "tmpupdated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "tmpid"
        ],
        "name": "mytempletes_pkey"
      },
      "foreign_keys": []
    },
    "mystyles": {
      "columns": [
        {
          "name": "style_id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "style_name",
          "type": "VARCHAR(100)",
          "nullable": false,
          "default": null
        },
        {
          "name": "style_name_en",
          "type": "VARCHAR(100)",
          "nullable": true,
          "default": null
        },
        {
          "name": "description",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "version",
          "type": "VARCHAR(20)",
          "nullable": true,
          "default": "'1.0'::character varying"
        },
        {
          "name": "display_order",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "style_id"
        ],
        "name": "mystyles_pkey"
      },
      "foreign_keys": []
    },
    "mycitations": {
      "columns": [
        {
          "name": "mcid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "mcname",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "mcauthors",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "mcpublicationyear",
          "type": "INTEGER",
          "nullable": false,
          "default": null
        },
        {
          "name": "mcsource_type",
          "type": "VARCHAR(20)",
          "nullable": false,
          "default": null
        },
        {
          "name": "mcpublisher",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcjorunalnm",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcvolume",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcissue",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcpages",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcurl",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcaccess_date",
          "type": "DATE",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcdoi",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "mcnotes",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "mccreated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "mcupdated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "mcid"
        ],
        "name": "mycitations_pkey"
      },
      "foreign_keys": []
    },
    "pnote_citations": {
      "columns": [
        {
          "name": "npcid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "citation_id",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "noteid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "nodeid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "npcstnum",
          "type": "INTEGER",
          "nullable": true,
          "default": null
        },
        {
          "name": "npcednum",
          "type": "INTEGER",
          "nullable": true,
          "default": null
        },
        {
          "name": "npcstatus",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        },
        {
          "name": "npcctid",
          "type": "UUID",
          "nullable": true,
          "default": null
        },
        {
          "name": "npcctdate",
          "type": "DATE",
          "nullable": true,
          "default": "CURRENT_DATE"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "npcid"
        ],
        "name": "pnote_citations_pkey"
      },
      "foreign_keys": [
        {
          "name": "pnote_citations_citation_id_fkey",
          "constrained_columns": [
            "citation_id"
          ],
          "referred_schema": null,
          "referred_table": "mycitations",
          "referred_columns": [
            "mcid"
          ],
          "options": {}
        },
        {
          "name": "pnote_citations_nodeid_fkey",
          "constrained_columns": [
            "nodeid"
          ],
          "referred_schema": null,
          "referred_table": "pronodes",
          "referred_columns": [
            "nodeid"
          ],
          "options": {}
        },
        {
          "name": "pnote_citations_noteid_fkey",
          "constrained_columns": [
            "noteid"
          ],
          "referred_schema": null,
          "referred_table": "pronote",
          "referred_columns": [
            "noteid"
          ],
          "options": {}
        },
        {
          "name": "pnote_citations_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        }
      ]
    },
    "mylib": {
      "columns": [
        {
          "name": "mlid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "mltitle",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "type",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "url",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "author",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "publisher",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "published_date",
          "type": "DATE",
          "nullable": true,
          "default": null
        },
        {
          "name": "accessed_date",
          "type": "DATE",
          "nullable": true,
          "default": "CURRENT_DATE"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "mlid"
        ],
        "name": "mylib_pkey"
      },
      "foreign_keys": []
    },
    "mylibitems": {
      "columns": [
        {
          "name": "item_id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "mlid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "item_type",
          "type": "VARCHAR(20)",
          "nullable": false,
          "default": "'file'::character varying"
        },
        {
          "name": "title",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "url",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "content",
          "type": "JSONB",
          "nullable": true,
          "default": null
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "item_id"
        ],
        "name": "mylibitems_pkey"
      },
      "foreign_keys": [
        {
          "name": "mylibitems_mlid_fkey",
          "constrained_columns": [
            "mlid"
          ],
          "referred_schema": null,
          "referred_table": "mylib",
          "referred_columns": [
            "mlid"
          ],
          "options": {}
        }
      ]
    },
    "notelib": {
      "columns": [
        {
          "name": "ntlid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "noteid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "nodeid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "mlid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "ntlkind",
          "type": "VARCHAR(20)",
          "nullable": true,
          "default": null
        },
        {
          "name": "ntlsaply",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "ntleaply",
          "type": "INTEGER",
          "nullable": true,
          "default": "0"
        },
        {
          "name": "ntldescrption",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "ntluserid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "ntldate",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "ntlid"
        ],
        "name": "notelib_pkey"
      },
      "foreign_keys": [
        {
          "name": "notelib_mlid_fkey",
          "constrained_columns": [
            "mlid"
          ],
          "referred_schema": null,
          "referred_table": "mylib",
          "referred_columns": [
            "mlid"
          ],
          "options": {}
        },
        {
          "name": "notelib_nodeid_fkey",
          "constrained_columns": [
            "nodeid"
          ],
          "referred_schema": null,
          "referred_table": "pronodes",
          "referred_columns": [
            "nodeid"
          ],
          "options": {}
        },
        {
          "name": "notelib_noteid_fkey",
          "constrained_columns": [
            "noteid"
          ],
          "referred_schema": null,
          "referred_table": "pronote",
          "referred_columns": [
            "noteid"
          ],
          "options": {}
        },
        {
          "name": "notelib_ntluserid_fkey",
          "constrained_columns": [
            "ntluserid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        },
        {
          "name": "notelib_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        }
      ]
    },
    "mytodolist": {
      "columns": [
        {
          "name": "id",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "uid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "prjid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "tododsporder",
          "type": "INTEGER",
          "nullable": false,
          "default": "0"
        },
        {
          "name": "todopriority",
          "type": "VARCHAR(20)",
          "nullable": false,
          "default": null
        },
        {
          "name": "tododsc",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "todocreatedt",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "todosttdt",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "todoupdatedt",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        },
        {
          "name": "todoenddt",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        },
        {
          "name": "todostatue",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "id"
        ],
        "name": "mytodolist_pkey"
      },
      "foreign_keys": [
        {
          "name": "mytodolist_prjid_fkey",
          "constrained_columns": [
            "prjid"
          ],
          "referred_schema": null,
          "referred_table": "projects",
          "referred_columns": [
            "prjid"
          ],
          "options": {}
        },
        {
          "name": "mytodolist_uid_fkey",
          "constrained_columns": [
            "uid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        }
      ]
    },
    "gensettings": {
      "columns": [
        {
          "name": "gstkeyid",
          "type": "UUID",
          "nullable": false,
          "default": "uuid_generate_v4()"
        },
        {
          "name": "gstkind",
          "type": "VARCHAR(20)",
          "nullable": false,
          "default": "'user'::character varying"
        },
        {
          "name": "uid",
          "type": "UUID",
          "nullable": false,
          "default": null
        },
        {
          "name": "gstname",
          "type": "VARCHAR(200)",
          "nullable": true,
          "default": null
        },
        {
          "name": "gstvalue",
          "type": "TEXT",
          "nullable": false,
          "default": null
        },
        {
          "name": "gsttype",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": null
        },
        {
          "name": "gstcategory",
          "type": "VARCHAR(50)",
          "nullable": true,
          "default": null
        },
        {
          "name": "gstdescription",
          "type": "TEXT",
          "nullable": true,
          "default": null
        },
        {
          "name": "gstisactive",
          "type": "BOOLEAN",
          "nullable": true,
          "default": "true"
        },
        {
          "name": "gstcreated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": "CURRENT_TIMESTAMP"
        },
        {
          "name": "gstupdated_at",
          "type": "TIMESTAMP",
          "nullable": true,
          "default": null
        }
      ],
      "primary_keys": {
        "constrained_columns": [
          "gstkeyid"
        ],
        "name": "gensettings_pkey"
      },
      "foreign_keys": [
        {
          "name": "gensettings_uid_fkey",
          "constrained_columns": [
            "uid"
          ],
          "referred_schema": null,
          "referred_table": "users",
          "referred_columns": [
            "uid"
          ],
          "options": {}
        }
      ]
    }
  },
  "data": {
    "format_categories": [],
    "format_rules": [],
    "prjuser": [],
    "clbcomments": [],
    "pnote_history": [],
    "users": [
      {
        "uid": "0559988f-e084-4f7a-b6f6-012f411403ac",
        "uemail": "test@example.com",
        "upassword": "$2b$12$1ejPrpSXYMqOa5aj6K01ae6eSaNICew9JgrK0HQSRzDUWBIE5gy0S",
        "urole": "user",
        "uavatar": "None",
        "ucreate_at": "2025-09-05 08:14:10.405924+09:00",
        "ulast_login": "None",
        "uupdated_at": "2025-09-05 08:14:10.405930+09:00"
      },
      {
        "uid": "815f124d-b794-44a3-a374-a8c8e985540f",
        "uemail": "test_1757060098@example.com",
        "upassword": "$2b$12$Kr0ldBK33HCIlcKfgix4b.YsDzyLHHKb0GXMPHKOVZdwtrIMFKyxO",
        "urole": "user",
        "uavatar": "None",
        "ucreate_at": "2025-09-05 08:14:58.741349+09:00",
        "ulast_login": "None",
        "uupdated_at": "2025-09-05 08:14:58.741355+09:00"
      },
      {
        "uid": "392261bd-dc31-4107-870f-df3f8eb00744",
        "uemail": "test@test.com",
        "upassword": "$2b$12$X9WbmKR76PVlvU3u9gaEcO4qC5AcqYkl8hreDlRJP.IGrbbUQ3NFe",
        "urole": "user",
        "uavatar": "None",
        "ucreate_at": "2025-09-05 08:39:01.161472+09:00",
        "ulast_login": "None",
        "uupdated_at": "2025-09-05 08:39:01.161481+09:00"
      },
      {
        "uid": "8189f799-fa49-4436-bc0b-8214e9afc20c",
        "uemail": "admin@example.com",
        "upassword": "$2b$12$bolvKrK.gfbv.ZyEWPIrh.5lclPY0.5WL7aaDxWv97KPR3agQaYa6",
        "urole": "admin",
        "uavatar": "None",
        "ucreate_at": "2025-09-05 10:56:18.447055+09:00",
        "ulast_login": "None",
        "uupdated_at": "2025-09-05 10:56:18.447061+09:00"
      },
      {
        "uid": "6dade884-eead-47de-be9d-21328e398d16",
        "uemail": "nicchals@naver.com",
        "upassword": "$2b$12$7I1BoJV.hpOswgPu/m39o.a6k7qwhL1qlZ9oSL15jj4Nr/jcWpwxu",
        "urole": "admin",
        "uavatar": "None",
        "ucreate_at": "2025-09-05 08:39:37.162536+09:00",
        "ulast_login": "2025-09-05 09:09:03.846070+09:00",
        "uupdated_at": "2025-09-05 08:39:37.162541+09:00"
      }
    ],
    "projects": [],
    "pronodes": [],
    "pronote": [],
    "mytempletes": [],
    "mystyles": [],
    "mycitations": [],
    "pnote_citations": [],
    "mylib": [],
    "mylibitems": [],
    "notelib": [],
    "mytodolist": [],
    "gensettings": []
  }
}