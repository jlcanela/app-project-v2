Submit Project

Parameters:
```
{
    "name": "Project",
    "budget": 10000,
    "cost": 12000,
    "status": "CREATED"
}
```

Rule Budget
Budget > Cost

outcome : boolean


Event
when all rules = true
  trigger event "GO"
otherwise 
  trigger event "NO-GO"

sample rules: 
https://gorules.io/industries
