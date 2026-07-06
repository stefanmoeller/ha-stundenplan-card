# Stundenplan Card

Custom Lovelace card for the `Stundenplan` integration.

Current card version: `0.3.1`

## Features

- `today` view: weekday + school end + subject list
- `compact_today` view: compact today list with subject color dots
- `table` view: weekly table with time column
- optional card title
- optional tap navigation

## Installation (HACS)

Add this repository as a **Dashboard** repository in HACS and install the card.

Prerequisite:

- Install the integration first:
  https://github.com/stefanmoeller/ha-stundenplan
- Recommended integration version: `0.2.3` or newer

Compatibility:

- The card relies on the stable attributes from `ha-stundenplan`.
- Integration and card are versioned independently and can be updated separately.

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

### Compact today mode

```yaml
type: custom:school-schedule-card
entity: sensor.stundenplan_fritz
mode: compact_today
show_title: false
```

### Week table mode

```yaml
type: custom:school-schedule-card
entity: sensor.stundenplan_fritz
mode: table
title: Wochenplan
```
