package ui

import rego.v1
#import data.access_control as acl
acl :=  {
    "project": [
      {
        "action": "create",
        "roles": ["admin"]
      },
      {
        "action": "read",
        "roles": ["admin", "project-manager"]
      },
      {
        "action": "read",
        "roles": ["developer"],
        "condition": ["is_assigned"]
      },
      {
        "action": "update",
        "roles": ["developer", "project-manager"]
      },
      {
        "action": "delete",
        "roles": ["admin"]
      }
    ],
    "party": [
      {
        "action": "create",
        "roles": ["admin"]
      },
      {
        "action": "read",
        "roles": ["admin"]
      },
      {
        "action": "update",
        "roles": ["admin"]
      },
      {
        "action": "delete",
        "roles": ["admin"]
      }
    ],
    "about": [
      {
        "action": "read",
        "roles": ["*"]
      }
    ],
    "admin": [
      {
        "action": "create",
        "roles": ["admin"]
      },
      {
        "action": "read",
        "roles": ["admin"]
      },
      {
        "action": "update",
        "roles": ["admin"]
      },
      {
        "action": "delete",
        "roles": ["admin"]
      }
    ],
    "config": [
      {
        "action": "read",
        "roles": ["admin"]
      }
    ],
    "communication": [
      {
        "action": "create",
        "roles": ["project-manager"]
      },
      {
        "action": "read",
        "roles": ["project-manager"]
      }
    ],
    "template": [
      {
        "action": "create",
        "roles": ["admin"]
      },
      {
        "action": "read",
        "roles": ["admin", "project-manager"]
      },
      {
        "action": "update",
        "roles": ["admin"]
      },
      {
        "action": "delete",
        "roles": ["admin"]
      }
    ]
  }


default access_control = {}

roles := input.user.roles

filter_action(roles, action_list) = actions if {
    actions := [ item.action | item := action_list[_]
        item_roles := {r | r := item.roles[_]}
        count(item_roles &  {r | r:= roles[_]}) > 0
    ]
}

keys := [k | k := object.keys(acl)[_]]

access_control := actions if {
  actions := {k: filter_action(roles, acl[k]) | k := object.keys(acl)[_]}
}

filter_conditions(roles, action_list) = conditions if {
    nested := [ item.condition | item := action_list[_];
        item_roles := {r | r := item.roles[_]};
        count(item_roles & {r | r := roles[_]}) > 0
    ]
    conditions := [x | some arr in nested; x := arr[_]]
}

cndtns := conditions if {
  conditions := {k: filter_conditions(roles, acl[k]) | k := object.keys(acl)[_]}
}

search := filters if {
  "read" in access_control.project
  "project" == input.search_entity
  filters := {
    "filters": cndtns.project
    # "access_control": access_control.project
  }
}
