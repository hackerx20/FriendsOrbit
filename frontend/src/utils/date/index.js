export const formatPostDate = (createdAt) => {
  const currentDate = new Date();
  const createdAtDate = new Date(createdAt);
  const timeInSeconds = Math.floor((currentDate - createdAtDate) / 1000);
  const timeInMinutes = Math.floor(timeInSeconds / 60);
  const timeInHours = Math.floor(timeInMinutes / 60);
  const timeInDays = Math.floor(timeInHours / 24);
  if (timeInDays > 1) {
    return createdAtDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else if (timeInDays === 1) {
    return "1day ago";
  } else if (timeInHours >= 1) {
    return `${timeInHours}hrs ago`;
  } else if (timeInMinutes >= 1) {
    return `${timeInMinutes}minutes ago`;
  } else {
    return "Just now";
  }
};
export const formatMemberSinceDate = (createdAt) => {
  const date = new Date(createdAt);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `Joined ${month} And ${year}`;
};
