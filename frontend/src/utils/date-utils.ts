export const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Unknown Date";
  
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
  
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };