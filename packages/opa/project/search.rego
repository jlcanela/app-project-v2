package search

import rego.v1
import data.shared as shared

acl := data.shared.access_control

default allow = {}

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

allow := filters if {
  "read" in access_control.project
  "project" == input.search_entity
  filters := {
    "filters": cndtns.project
    # "access_control": access_control.project
  }
}
