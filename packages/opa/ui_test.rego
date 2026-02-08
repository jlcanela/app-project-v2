package ui_test

import rego.v1
import data.ui.access_control
import data.ui

test_access_control_admin if {
    actions := access_control with input as {"user": {"id": "u1", "roles": ["admin"]}}
    # All expected resources/actions for admin
    actions["about"] == []
    actions["admin"] == ["create", "read", "update", "delete"]
    actions["communication"] == []
    actions["config"] == ["read"]
    actions["party"] == ["create", "read", "update", "delete"]
    actions["project"] == ["create", "read", "delete"]
    actions["template"] == ["create", "read", "update", "delete"]
}

test_access_control_developer if {
    actions := access_control with input as {
        "user": {
            "id": "u2", 
            "roles": ["developer"]
        }
    }
    actions["about"] == []
    actions["admin"] == []
    actions["communication"] == []
    actions["config"] == []
    actions["party"] == []
    actions["project"] == ["read", "update"]
    actions["template"] == []
}

test_access_control_project_manager if {
    actions := access_control with input as {
        "user": {
            "id": "u3", 
            "roles": ["project-manager"]
        }
    }
    actions["about"] == []
    actions["admin"] == []
    actions["communication"] == ["create", "read"]
    actions["config"] == []
    actions["party"] == []
    actions["project"] == ["read", "update"]
    actions["template"] == ["read"]
}

