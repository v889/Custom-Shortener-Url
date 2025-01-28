
import axios from "axios";
import ShortUrl from '../model/url.js';
import Analytics from '../model/analytics.js';
import { redis } from '../utils/redis.js';

import mongoose from "mongoose";
import useragent from "useragent";

const BASE_URL = "http://localhost:3000/api/shorten/" || process.env.BASE_URL;
// POST /api/shorten
export const createUrl = async (req,res) => {
  try {
    const { longUrl, customAlias = '', topic = '' } = req.body;
    const { _id } = req.user;
    const uid=_id
    
    // Checking if the user already created the short-url and saved in Redis
    const cachedData = await redis.get(customAlias);
    if (cachedData) {
      const cacheResult = JSON.parse(cachedData);
      return {
        shortUrl: `${BASE_URL}/${cacheResult.alias}`,
        createdAt: cacheResult.createdAt,
      };
    } else {
      // Checking if the user already created a short-url
      const existingUrl = await ShortUrl.findOne({ originalUrl: longUrl });
      let shortUrlRecord = {};

      if (!existingUrl) {
        // Creating an alias if customAlias was not provided
     

        // Setting the shortUrl details in Redis for 1 hour
        const shortId = customAlias?.length ? customAlias : new mongoose.Types.ObjectId().toString();

shortUrlRecord = await ShortUrl.create({
  originalUrl: longUrl,
  topic: topic,
  uid: uid,
  alias: shortId,
});

// Save shortUrlRecord and set to Redis
redis.set(shortId, JSON.stringify(shortUrlRecord), "EX", 3600);
res.status(201).json({
  shortUrl: `${BASE_URL}/${shortId}`,
  createdAt: shortUrlRecord.createdAt,
});
      } 
      else {
        // If short-url already exists in DB, setting it in Redis and returning it
        
        redis.set(existingUrl.alias, JSON.stringify(existingUrl), 'EX', 3600);
      
        res.status(201).json( {
          shortUrl: `${BASE_URL}/${existingUrl.alias}`,
          createdAt: existingUrl.createdAt,
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const redirectUrl = async (req,res) => {
  try {
    // Getting the alias from params
    const alias = req.params.alias;
    const { _id } = req.user;
    const uid=_id

    // Getting os, deviceType, ipAddress from headers
    const agent = useragent.parse(req.headers['user-agent']);
    const os = agent.os.toString();
    const deviceType = agent.device.toString();
    const ipAddress = req.headers['x-forwarded-for'] || // For multiple forwarded IPs
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    null;
  console.log(req.headers['x-forwarded-for'] )
  console.log('IP Address:', ipAddress);

    //Fetching geolocation using geojs
    const response = await axios.get(
      `https://get.geojs.io/v1/ip/geo/${ipAddress}.json`
    );
    const lat = response.data.latitude;
    const long = response.data.longitude;

    let analyticsRecord = {
      os: os,
      deviceType: deviceType,
      ipAddress: ipAddress,
      latitude: lat,
      longitude: long,
    };

    // Checking the same cache set during createUrl in case user wants to check redirect feature
    const cachedData = await redis.get(alias);
    if (cachedData) {
      const cacheResult = JSON.parse(cachedData);
      analyticsRecord = {
        ...analyticsRecord,
        shortId: alias,
        createdBy: cacheResult.createdBy,
        topic: cacheResult.topic,
        clickedAt: new Date(),
        uid:uid
      };

      await Analytics.create(analyticsRecord); // Use Mongoose create for storing analytics
      return res.redirect(cacheResult.originalUrl);
    } else {
      // Finding shortUrl in DB and returning the longUrl to controller
      const existingUrl = await ShortUrl.findOne({ alias: alias });

      analyticsRecord = {
        ...analyticsRecord,
        shortId: alias,
        createdBy: existingUrl.uid,
        topic: existingUrl.topic,
        clickedAt: new Date(),
        uid:uid
      };

      await Analytics.create(analyticsRecord); // Use Mongoose create for storing analytics
      return res.redirect(existingUrl.originalUrl);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
