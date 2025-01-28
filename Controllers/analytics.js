import Analytics from "../model/analytics.js"
import ShortUrl from "../model/url.js";
import { redis } from "../utils/redis.js";

const osAnalysis = async (cond) => {
  return Analytics.aggregate([
    { $match: cond }, // Filter by the given condition (shortId)
    { $group: {
      _id: "$os", // Group by the OS
      uniqueClicks: { $sum: 1 }, // Count the total number of clicks for each OS
      uniqueUsers: { $addToSet: "$uid" } // Count the unique users for each OS
    }},
    { $project: {
      osName: "$_id", // Rename the _id field to osName
      uniqueClicks: 1,
      uniqueUsers: { $size: "$uniqueUsers" } // Count the number of unique users
    }},
    { $sort: { uniqueClicks: -1 } } // Sort by the number of clicks
  ]);
};
const deviceAnalysis = async (cond) => {
  return Analytics.aggregate([
    { $match: cond }, // Filter by the given condition (shortId)
    { $group: {
      _id: "$deviceType", // Group by the device type
      uniqueClicks: { $sum: 1 }, // Count the total number of clicks for each device type
      uniqueUsers: { $addToSet: "$uid" } // Count the unique users for each device type
    }},
    { $project: {
      deviceName: "$_id", // Rename the _id field to deviceName
      uniqueClicks: 1,
      uniqueUsers: { $size: "$uniqueUsers" } // Count the number of unique users
    }},
    { $sort: { uniqueClicks: -1 } } // Sort by the number of clicks
  ]);
};
const clickByDates = async (cond) => {
  return Analytics.aggregate([
    { $match: cond }, // Filter by the given condition (shortId)
    {
      $project: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } }, // Convert clickedAt date to 'YYYY-MM-DD' format
        uid: 1, // Keep uid
      },
    },
    {
      $group: {
        _id: { day: "$day", uid: "$uid" }, // Group by day and uid (unique users)
        count: { $sum: 1 }, // Count the clicks
      },
    },
    { $sort: { _id: -1 } }, // Sort by date in descending order
  ]);
};


// Alias Analytics for a given alias
export const aliasAnalytics = async (req, res, next) => {
  try {
    const alias = req.params.alias;
    const cacheResult = await redis.get(alias);
    
    if (cacheResult) {
      // If data exists in cache, return it
      const cacheData = JSON.parse(cacheResult);
      return res.status(200).json(cacheData);
    } else {
      // Find the ShortUrl for the given alias
      const shortUrl = await ShortUrl.findOne({ alias });
      if (!shortUrl) {
        return res.status(404).json({ message: "Short URL not found" });
      }

      const shortUrlId = shortUrl._id; // Assuming _id is the shortId
      const cond = { shortId: shortUrlId };

      // Aggregation for the total clicks, unique clicks, and other analytics
      const [totalClicks, uniqueClicks, clicksByDate, osType, deviceType] = await Promise.all([
        // Total clicks for the given shortUrl
        Analytics.countDocuments({ shortId: shortUrlId }),

        // Unique users who clicked on the shortUrl (excluding "Other" uid)
        Analytics.countDocuments({
          shortId: shortUrlId,
          uid: { $ne: "Other" }
        }),

       
        clickByDates(cond),

        // OS analysis (for the last 7 days)
        osAnalysis(cond),

        // Device type analysis (for the last 7 days)
        deviceAnalysis(cond)
      ]);

      const responseObject = {
        totalClicks,
        uniqueClicks,
        clicksByDate,
        osType,
        deviceType,
      };

      // Store the result in Redis for 30 minutes (1800 seconds)
      await redis.set(alias, JSON.stringify(responseObject), "EX", 1800);
      return res.status(200).json(responseObject);
    }
  } catch (err) {
    console.error("Error in getUrlAnalytics:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};





export const topicAnalysis=async (req, res, next) => {
  try {
    const topic = req.params.topic;
    const cacheResult = await redis.get(topic);

    if (cacheResult) {
      return res.status(200).json(JSON.parse(cacheResult));
    }

    // Find all short URLs for the given topic
    const shortUrls = await ShortUrl.find({ topic });
    if (!shortUrls.length) {
      return res.status(404).json({ message: "No URLs found for this topic" });
    }

    const topicAnalytics = await Promise.all(
      shortUrls.map(async (shortUrl) => {
        const shortUrlId = shortUrl.alias;
        const cond = { shortId: shortUrlId };

        const [totalClicks, uniqueClicks, clicksByDate] = await Promise.all([
          Analytics.countDocuments({ shortId: shortUrlId }), // Count total clicks
          Analytics.aggregate([
            { $match: { shortId: shortUrlId } }, // Match documents with the specific shortUrlId
            { $group: { _id: null, uniqueUsers: { $addToSet: "$uid" } } }, // Create an array of unique users
            { $project: { uniqueUsersCount: { $size: "$uniqueUsers" } } } // Count the unique users
          ]), // Count unique clicks
          clickByDates(cond) // Aggregation for clicks by date
        ]);

        return {
          shortUrl: shortUrl.alias,
          totalClicks,
          uniqueUsers: uniqueClicks,
          clicksByDate,
        };
      })
    );

    const totalClicksForTopic = topicAnalytics.reduce((sum, urlAnalytics) => sum + urlAnalytics.totalClicks, 0);
    const uniqueUsersForTopic = topicAnalytics.reduce((sum, urlAnalytics) => sum + urlAnalytics.uniqueUsers, 0);

    const responseObject = {
      totalClicks: totalClicksForTopic,
      uniqueUsers: uniqueUsersForTopic,
      clicksByDate: clickByDates, // Aggregate clicks for the topic
      urls: topicAnalytics,
    };

    // Store the result in Redis for 30 minutes (1800 seconds)
    await redis.set(topic, JSON.stringify(responseObject), "EX", 1800);
    return res.status(200).json(responseObject);
  } catch (err) {
    console.error("Error in getTopicAnalytics:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const overallAnalysis = async (req, res, next) => {
  try {
    const { _id } = req.user;
    if (!_id) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const uid = _id;

    console.log(`Fetching analytics for user: ${uid}`);
    const cacheResult = await redis.get(uid);

    if (cacheResult) {
      const cacheData = JSON.parse(cacheResult);
      return res.status(200).json({ success: true, data: cacheData });
    }

    const cond = { uid: uid };

    // Execute Mongoose queries
    const [
      totalUrls,
      totalClicks,
      uniqueUsers,
      clicksByDate,
      osType,
      deviceType,
    ] = await Promise.all([
      // Count total URLs created by the user
      ShortUrl.countDocuments({ uid: uid }),

      // Count total clicks for URLs created by the user
      Analytics.countDocuments({ uid: uid }),

      // Count unique users who interacted with the user's URLs (ignoring "Other")
      Analytics.distinct("uid", { uid: uid, topic: { $ne: "Other" } })
        .then((users) => users.length),

      // Count clicks by date
      Analytics.aggregate([
        { $match: cond },
        {
          $project: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } }, // Convert clickedAt date to 'YYYY-MM-DD' format
            uid: 1, // Keep uid
          },
        },
        {
          $group: {
            _id: { day: "$day", uid: "$uid" }, // Group by day and uid (unique users)
            count: { $sum: 1 }, // Count the clicks
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Analyze clicks by OS type
      Analytics.aggregate([
        { $match: cond },
        {
          $group: {
            _id: "$os",
            uniqueClicks: { $sum: 1 },
            uniqueUsers: { $addToSet: "$uid" },
          },
        },
        {
          $project: {
            osName: "$_id",
            uniqueClicks: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
          },
        },
        { $sort: { uniqueClicks: -1 } },
      ]),

      // Analyze clicks by device type
      Analytics.aggregate([
        { $match: cond },
        {
          $group: {
            _id: "$deviceType",
            uniqueClicks: { $sum: 1 },
            uniqueUsers: { $addToSet: "$uid" },
          },
        },
        {
          $project: {
            deviceName: "$_id",
            uniqueClicks: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
          },
        },
        { $sort: { uniqueClicks: -1 } },
      ]),
    ]);

    // Prepare the response object
    const responseObject = {
      totalUrls,
      totalClicks,
      uniqueUsers,
      clicksByDate,
      osType,
      deviceType,
    };

    // Cache the result in Redis for 30 minutes
    await redis.set(uid, JSON.stringify(responseObject), "EX", 1800);
    return res.status(200).json({ success: true, data: responseObject });
  } catch (err) {
    console.error("Error fetching analytics:", err.stack || err);
    return res.status(500).json({ message: "Server error" });
  }
};

