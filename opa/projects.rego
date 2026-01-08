package projects

# METADATA
# scope: document
# compile:
#   unknowns: [input.projects]

read if {
	input.projects.owner == input.user.id
	not input.favorite
}

# Include if user is admin
read if {
  some i
  input.user.roles[i] == "admin"
}