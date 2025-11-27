export const Follower = [
  {
    id: 1,
    apiurl: "api/Instagram",
    url: "total-followers",
    title: "Followers",
  },
];

export const TotalFollowers = [
  {
    id: 1,
    apiurl: "api/Instagram",
    url: "GetFollowers",
    title: "Followers",
    metricType: "followers",
  },
  {
    id: 2,
    apiurl: "api/Instagram",
    url: "GetTotalPosts",
    title: "Total Posts",
    metricType: "posts",
  },
  {
    id: 3,
    apiurl: "api/Instagram",
    url: "GetTotalLikes",
    title: "Total Likes",
    metricType: "likes",
  },
];

export const GetPostsByDateRange = [
  {
    id: 1,
    apiurl: "Instagram",
    url: "GetPostsByDateRange",
    title: "Last 5 top posts",
  },
];

export const GetPostsDetailsByDateRange = [
  {
    id: 1,
    apiurl: "Instagram",
    url: "GetMetricsByDateRange",
    title: "Post Metrics By DateRange",
  },
];
