package filters_test

import rego.v1
import data.filters.include

#
# Non-low budget: include if user matches
#

test_include_non_low_budget_for_user if {
  include with input as {
    "user": "alice",
    "users": [{"name": "alice"}],
    "products": {"price": 1000},
    "budget": "medium",
  }
}

test_exclude_non_low_budget_for_other_user if {
  not include with input as {
    "user": "alice",
    "users": [{"name": "bob"}],
    "products": {"price": 1000},
    "budget": "medium",
  }
}

#
# Low budget: only include if price < 500
#

test_include_low_budget_under_500 if {
  include with input as {
    "user": "alice",
    "users": [{"name": "alice"}],
    "products": {"price": 499},
    "budget": "low",
  }
}

test_exclude_low_budget_equal_500 if {
  not include with input as {
    "user": "alice",
    "users": [{"name": "alice"}],
    "products": {"price": 500},
    "budget": "low",
  }
}

test_exclude_low_budget_over_500 if {
  not include with input as {
    "user": "alice",
    "users": [{"name": "alice"}],
    "products": {"price": 501},
    "budget": "low",
  }
}

test_exclude_low_budget_other_user if {
  not include with input as {
    "user": "alice",
    "users": [{"name": "bob"}],
    "products": {"price": 100},
    "budget": "low",
  }
}

#
# Free products are always included
#

test_include_free_product_even_low_budget if {
  include with input as {
    "user": "alice",
    "users": {"name": "bob"},   # user mismatch on purpose
    "products": {"price": "free"},
    "budget": "low",
  }
}

test_include_free_product_even_non_low_budget if {
  include with input as {
    "user": "alice",
    "users": {"name": "bob"},
    "products": {"price": "free"},
    "budget": "medium",
  }
}
