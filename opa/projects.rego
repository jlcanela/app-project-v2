package projects

# METADATA
# scope: document
# compile:
#   unknowns: [input.projects]
include if input.projects.name == input.favorite

include if {
	input.projects.name == "the-project"
	not input.favorite
}

# Include if user is admin
include if {
  some i
  input.user.roles[i] == "admin"
}