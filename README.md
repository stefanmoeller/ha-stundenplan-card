# Stundenplan Card

Custom Lovelace card for the `Stundenplan` integration.

## Features

- `today` view: weekday + school end + subject list
- `table` view: weekly table with time column
- optional card title
- optional tap navigation

## Installation (HACS)

Add this repository as a **Dashboard** repository in HACS and install the card.

Then add resource:

```yaml
url: /hacsfiles/ha-stundenplan-card/school-schedule-card.js
type: module
```

## Card config

```yaml
type: custom:school-schedule-card
entity: sensor.stundenplan_fritz
mode: today
title: Stundenplan
show_title: true
```

### Week table mode

```yaml
type: custom:school-schedule-card
entity: sensor.stundenplan_fritz
mode: table
title: Wochenplan
```
