type GroupLogEvent = "group.create" | "group.join" | "group.leave" | "group.invite"

export function logGroupEvent(
    event: GroupLogEvent,
    payload: Record<string, string | number | boolean | null | undefined>
): void {
    console.log(
        JSON.stringify({
            level: "info",
            domain: "group",
            event,
            timestamp: new Date().toISOString(),
            ...payload,
        })
    )
}
