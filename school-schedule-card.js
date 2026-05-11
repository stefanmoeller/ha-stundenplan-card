const CARD_TYPE = "school-schedule-card";
const CARD_VERSION = "1.0.1";
const DEFAULT_CONFIG = {
  mode: "today",
  title: "Stundenplan",
  show_title: true,
};
const SUPPORTED_MODES = new Set(["today", "table"]);

class SchoolScheduleCard extends HTMLElement {
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states || {}).find((entityId) =>
      entityId.startsWith("sensor.stundenplan_")
    );
    return {
      entity,
      mode: DEFAULT_CONFIG.mode,
      title: DEFAULT_CONFIG.title,
    };
  }

  setConfig(config) {
    if (!config?.entity) {
      throw new Error("entity is required");
    }
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return this.config?.mode === "table" ? 6 : 4;
  }

  navigate() {
    const tap = this.config?.tap_action;
    if (tap?.action === "navigate" && tap.navigation_path) {
      history.pushState(null, "", tap.navigation_path);
      window.dispatchEvent(new Event("location-changed"));
    }
  }

  render() {
    if (!this.config || !this._hass) {
      return;
    }

    const state = this._hass.states[this.config.entity];
    if (!state) {
      this.innerHTML = `<ha-card><div class="card-content">Entity not found: ${this.escape(this.config.entity)}</div></ha-card>`;
      return;
    }

    const mode = this.config.mode || "today";
    const clickable = this.config.tap_action?.action === "navigate";
    this.innerHTML = `
      <ha-card class="${clickable ? "clickable" : ""}" ${clickable ? 'role="button" tabindex="0"' : ""}>
        ${this.config.show_title !== false && this.config.title ? `<div class="card-header">${this.escape(this.config.title)}</div>` : ""}
        <div class="card-content">
          ${mode === "today" ? this.renderToday(state) : ""}
          ${mode === "table" ? this.renderTable(state) : ""}
          ${!SUPPORTED_MODES.has(mode) ? `<div class="empty">Unknown mode: ${this.escape(mode)}</div>` : ""}
        </div>
      </ha-card>
      <style>
        ha-card.clickable { cursor: pointer; }
        .today-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .headline { font-size: 1.1rem; font-weight: 650; }
        .subline {
          color: var(--secondary-text-color);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .subline ha-icon {
          --mdc-icon-size: 16px;
          width: 16px;
          height: 16px;
          display: block;
          line-height: 1;
          transform: translateY(-0.5px);
        }
        .empty {
          padding: 10px;
          border-radius: 8px;
          background: var(--secondary-background-color);
          color: var(--secondary-text-color);
        }
        .lesson-list { display: flex; flex-direction: column; gap: 9px; }
        .lesson {
          display: flex;
          align-items: center;
        }
        .pill {
          --subject-color: var(--primary-color);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: 100%;
          border-radius: 999px;
          background: color-mix(in srgb, var(--subject-color) 30%, var(--card-background-color));
          color: var(--primary-text-color);
          overflow: hidden;
          padding: 4px 10px 4px 4px;
        }
        .icon-circle {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--subject-color);
          overflow: hidden;
          line-height: 0;
          flex: 0 0 auto;
        }
        .icon-circle ha-icon {
          --mdc-icon-size: 18px;
          width: 18px;
          height: 18px;
          color: white;
          display: block;
          line-height: 1;
          transform: translateY(-0.5px);
        }
        .lesson-name {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .table-wrap { overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; min-width: 620px; }
        th, td {
          border: 0;
          border-bottom: 1px solid var(--divider-color);
          padding: 8px;
          vertical-align: middle;
        }
        th {
          text-align: left;
          font-weight: 650;
          color: var(--primary-text-color);
          background: transparent;
        }
        td.time {
          white-space: nowrap;
          color: var(--secondary-text-color);
          font-size: 0.9rem;
          width: 125px;
        }
        .cell-pill {
          --subject-color: var(--primary-color);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: 100%;
          border-radius: 999px;
          background: color-mix(in srgb, var(--subject-color) 30%, var(--card-background-color));
          color: var(--primary-text-color);
          overflow: hidden;
          padding: 3px 9px 3px 3px;
        }
        .cell-pill .icon-circle {
          width: 22px;
          height: 22px;
          min-width: 22px;
        }
        .cell-pill .icon-circle ha-icon {
          --mdc-icon-size: 14px;
          width: 14px;
          height: 14px;
        }
      </style>
    `;

    if (clickable) {
      const card = this.querySelector("ha-card");
      card?.addEventListener("click", () => this.navigate());
      card?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.navigate();
        }
      });
    }
  }

  renderToday(state) {
    const a = state.attributes || {};
    const weekday = a.weekday_name || "Heute";
    const schoolEnd = a.school_end || "-";

    if (a.is_free_day) {
      return `
        <div class="today-header">
          <div class="headline">${this.escape(weekday)}</div>
          <div class="subline"><ha-icon icon="mdi:clock-check-outline"></ha-icon><span>${this.escape(schoolEnd)}</span></div>
        </div>
        <div class="empty">Schulfrei${a.free_reason ? `: ${this.escape(a.free_reason)}` : ""}</div>
      `;
    }

    const lessons = a.lessons || [];
    if (!a.is_school_day || !lessons.length) {
      return `
        <div class="today-header">
          <div class="headline">${this.escape(weekday)}</div>
          <div class="subline"><ha-icon icon="mdi:clock-check-outline"></ha-icon><span>${this.escape(schoolEnd)}</span></div>
        </div>
        <div class="empty">Keine Stunden</div>
      `;
    }

    return `
      <div class="today-header">
        <div class="headline">${this.escape(weekday)}</div>
        <div class="subline"><ha-icon icon="mdi:clock-check-outline"></ha-icon><span>${this.escape(schoolEnd)}</span></div>
      </div>
      <div class="lesson-list">
        ${lessons.map((lesson) => this.renderLessonPill(lesson)).join("")}
      </div>
    `;
  }

  renderTable(state) {
    const a = state.attributes || {};
    const lessonTimes = a.lesson_times || [];
    const schoolDays = a.school_days || [];
    const days = a.days || {};
    const maxRows = Number(a.lesson_count || lessonTimes.length || 0);

    if (!maxRows || !schoolDays.length) {
      return `<div class="empty">Keine Stundenplandaten gefunden.</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Zeit</th>
              ${schoolDays.map((day) => `<th>${this.escape(days[day]?.name || a.weekday_names?.[day] || day)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: maxRows }, (_, i) => `
              <tr>
                <td class="time">${this.escape(lessonTimes[i]?.start || "")} - ${this.escape(lessonTimes[i]?.end || "")}</td>
                ${schoolDays.map((day) => {
                  const gridLesson = days[day]?.lesson_grid?.[i];
                  const foundLesson = (days[day]?.lessons || []).find((l) => Number(l.hour) === i + 1);
                  const lesson = gridLesson || foundLesson;
                  return `<td>${lesson ? this.renderTableLesson(lesson) : `<span class="empty">-</span>`}</td>`;
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  renderLessonPill(lesson) {
    const color = this.cssValue(lesson.color || "var(--primary-color)");
    const icon = this.escape(lesson.icon || "mdi:book-open-page-variant");
    const subject = this.escape(lesson.subject || "");
    return `
      <div class="lesson">
        <span class="pill" style="--subject-color:${color}">
          <span class="icon-circle"><ha-icon icon="${icon}"></ha-icon></span>
          <span class="lesson-name">${subject}</span>
        </span>
      </div>
    `;
  }

  renderTableLesson(lesson) {
    const color = this.cssValue(lesson.color || "var(--primary-color)");
    const icon = this.escape(lesson.icon || "mdi:book-open-page-variant");
    const subject = this.escape(lesson.subject || "");
    return `
      <span class="cell-pill" style="--subject-color:${color}">
        <span class="icon-circle" style="--subject-color:${color}"><ha-icon icon="${icon}"></ha-icon></span>
        <span>${subject}</span>
      </span>
    `;
  }

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  cssValue(value) {
    return String(value ?? "").replace(/[;"'<>]/g, "");
  }
}

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, SchoolScheduleCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: "Stundenplan Card",
    description: "Today and week table view for the Stundenplan integration.",
  });
}

if (!window.__stundenplanCardVersionLogged) {
  window.__stundenplanCardVersionLogged = true;
  console.info(
    "%c STUNDENPLAN-CARD %c VERSION %c " + CARD_VERSION + " ",
    "background:#111;color:#f5b400;font-weight:700;padding:2px 6px;border-radius:2px 0 0 2px;",
    "background:#2a2a2a;color:#fff;font-weight:700;padding:2px 6px;",
    "background:#f57c00;color:#fff;font-weight:700;padding:2px 6px;border-radius:0 2px 2px 0;"
  );
}
