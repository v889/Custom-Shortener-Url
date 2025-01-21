import express from 'express';
import { nanoid } from 'nanoid';
import ShortUrl from '../model/url.js';


// POST /api/shorten
export const urlCreation=async (req, res) => {
  try {
    console.log("hoi",req.body)
    const { longUrl, customAlias, topic } = req.body;

    // Validate longUrl
    if (!longUrl) {
      return res.status(400).json({ message: 'longUrl is required' });
    }

    // Check if customAlias already exists
    if (customAlias) {
      const existingAlias = await ShortUrl.findOne({ shortUrl: customAlias });
      if (existingAlias) {
        return res.status(400).json({ message: 'customAlias already exists' });
      }
    }

    // Generate unique alias if customAlias is not provided
    const alias = customAlias || nanoid(7); // Default length is 7 characters

    // Create and save the short URL
    const shortUrl = new ShortUrl({
      longUrl,
      shortUrl: alias,
      topic,
      createdAt: new Date(),
    });
    await shortUrl.save();

    res.status(201).json({
      shortUrl: `${req.protocol}://${req.get('host')}/${alias}`,
      createdAt: shortUrl.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};