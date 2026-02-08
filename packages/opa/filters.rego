package filters

import rego.v1

default include := false

include if {
  some index
  input.users[index].name == input.user
  input.budget != "low"
}

include if {
  input.users.name == input.user
  input.budget == "low"
  input.products.price < 500
}

include if {
  input.products.price == "free"
}
