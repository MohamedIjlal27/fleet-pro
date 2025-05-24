// Constants for status colors
const STATUS_COLORS = {
  driving: '#0A84FF', // blue
  idling: '#ffc107', // yellow
  parking: '#6c757d', // gray
  online: '#0A84FF', // blue
  moving: '#0A84FF', // blue
  stationary: '#FAAD14', // yellow
  offline: '#9CA0A4', // gray
  default: '#9CA0A4', // gray
};

// Memoized functions
export const getStatusColor = (status: string) => {
  if (!status) return STATUS_COLORS.default;
  return (
    STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.default
  );
}