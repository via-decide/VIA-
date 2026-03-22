# VIA Sovereign Operational Preferences

## casio_gbd_200_bridge
label: Casio GBD-200 Bridge
kind: toggle
control: binary
storage_key: casio_gbd_200_bridge
summary: Optional wearable bridge for device-assisted haptic and rhythm routing.
default: disable
option: enable | ENABLE | Allow VIA to prepare Casio bridge state and future device pairing metadata.
option: disable | DISABLE | Keep the onboarding session software-only without bridge metadata.

## telemetry_visibility
label: Telemetry Visibility
kind: selector
control: binary
storage_key: telemetry_visibility
summary: Choose whether sovereign dashboards surface live operational telemetry.
default: live_ops
option: live_ops | LIVE OPS | Show active stats, signal overlays, and high-visibility operations panels.
option: private | PRIVATE | Keep operational telemetry hidden outside your personal control surface.
