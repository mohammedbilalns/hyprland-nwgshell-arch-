import options from "options"
const { messageAsync } = await Service.import("hyprland")

const { hyprland } = options
const {
    spacing,
    radius,
    border: { width },
    blur,
    shadows,
    dark: { primary: { bg: darkActive } },
    light: { primary: { bg: lightActive } },
    scheme,
} = options.theme

const deps = [
    "hyprland",
    spacing.id,
    radius.id,
    blur.id,
    width.id,
    shadows.id,
    darkActive.id,
    lightActive.id,
    scheme.id,
]

export default function init() {
    options.handler(deps, setupHyprland)
    setupHyprland()
}

function activeBorder() {
    const color = scheme.value === "dark"
        ? darkActive.value
        : lightActive.value

    return color.replace("#", "")
}

function sendBatch(batch: string[]) {
    const cmd = batch
        .filter(x => !!x)
        .map(x => `keyword ${x}`)
        .join("; ")

    return messageAsync(`[[BATCH]]/${cmd}`)
}

async function setupHyprland() {
    const wm_gaps = Math.floor(hyprland.gaps.value * spacing.value)
    const gaps_custom = 1
    sendBatch([
        `general:border_size ${width}`,
        `general:gaps_out ${gaps_custom}`,
        `general:gaps_in ${Math.floor(gaps_custom)}`,
        `general:col.active_border rgba(${activeBorder()}ff)`,
        `general:col.inactive_border rgba(${hyprland.inactiveBorder.value})`,
        `decoration:rounding ${radius}`,
        `decoration:drop_shadow ${shadows.value ? "yes" : "no"}`,
        `dwindle:no_gaps_when_only ${hyprland.gapsWhenOnly.value ? 0 : 1}`,
        `master:no_gaps_when_only ${hyprland.gapsWhenOnly.value ? 0 : 1}`,
    ])

    await sendBatch(App.windows.map(({ name }) => `layerrule unset, ${name}`))

    if (blur.value > 0) {
        sendBatch(App.windows.flatMap(({ name }) => [
            `layerrule unset, ${name}`,
            `layerrule blur, ${name}`,
            `layerrule ignorealpha ${/* based on shadow color */.29}, ${name}`,
        ]))
    }
}
