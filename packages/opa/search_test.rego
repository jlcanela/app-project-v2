package search_test

import rego.v1
import data.search.allow

test_allow_admin if {
    allowed := allow with input as {"search_entity": "project", "user": {"id": "u1", "roles": ["admin"]}}
    # All expected resources/actions for admin
    allowed["filters"] == []
}

test_allow_developer if {
    allowed := allow with input as {"search_entity": "project", "user": {"id": "u1", "roles": ["developer"]}}
    # All expected resources/actions for admin
    allowed["filters"] == [ "is_assigned" ]
}
