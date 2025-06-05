export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-Us", { hours: "2-digit", minutes: "2-digit", hour12: false });
}