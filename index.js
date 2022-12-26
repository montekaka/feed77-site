import { getFeedParams } from "./libs/feed-params.js"
import { request } from "./libs/web.js"
import { FeedMaker } from "./libs/feed-maker.js"
import express from "express"
import dotenv from "dotenv"
// const express = require('express');
// const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get('/healthcheck', (req, res) => {
  res.status(200).send("okay")
});

app.get('/sheets/:sheetId/rows/:rowNumber', async (req, res) => {
  try {
    const {sheetId, rowNumber} = req.params;
    const feedParams = await getFeedParams(sheetId, parseInt(rowNumber) - 1);
    if(feedParams) {
      const { address, mainPatterns, itemPatterns, feedTitle, feedLink,feedDesc,itemTitle,itemLink,itemDesc} = feedParams;
      const responseHTML = await request(address);
      if(responseHTML) {
        const f = new FeedMaker();
        f.setFeedProp(feedTitle, feedLink, feedDesc);
        f.setPatterns(itemPatterns, mainPatterns);
        f.setItemProp(itemTitle, itemLink, itemDesc);
        f.source = responseHTML;
        f.findItems();
        f.findMain();
        const rssFeed = f.makeFeed();
        if(rssFeed.length > 10) {
          res.header("Content-Type", "application/xml");
          res.status(200).send(rssFeed);
          return;
        }
      }
    }

    res.status(500).send("Something went wrong");
    // return notFoundResponse;
  } catch(e) {
    console.log(e);
    res.status(500).send("Something went wrong");
  }
})

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});