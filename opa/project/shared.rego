package shared

access_control := {
        "about": [
            {
                "action": "read",
                "roles": [
                    "*"
                ]
            }
        ],
        "admin": [
            {
                "action": "create",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "read",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "update",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "delete",
                "roles": [
                    "admin"
                ]
            }
        ],
        "communication": [
            {
                "action": "create2",
                "roles": [
                    "project-manager"
                ]
            },
            {
                "action": "read",
                "roles": [
                    "project-manager"
                ]
            }
        ],
        "config": [
            {
                "action": "read",
                "roles": [
                    "admin"
                ]
            }
        ],
        "party": [
            {
                "action": "create",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "read",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "update",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "delete",
                "roles": [
                    "admin"
                ]
            }
        ],
        "project": [
            {
                "action": "create",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "read",
                "roles": [
                    "admin",
                    "project-manager"
                ]
            },
            {
                "action": "read",
                "condition": [
                    "project_is_assigned"
                ],
                "roles": [
                    "developer"
                ]
            },
            {
                "action": "update",
                "roles": [
                    "developer",
                    "project-manager"
                ]
            },
            {
                "action": "delete",
                "roles": [
                    "admin"
                ]
            }
        ],
        "template": [
            {
                "action": "create",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "read",
                "roles": [
                    "admin",
                    "project-manager"
                ]
            },
            {
                "action": "update",
                "roles": [
                    "admin"
                ]
            },
            {
                "action": "delete",
                "roles": [
                    "admin"
                ]
            }
        ]
    }
